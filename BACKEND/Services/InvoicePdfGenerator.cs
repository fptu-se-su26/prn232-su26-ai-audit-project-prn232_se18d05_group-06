using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;

namespace BACKEND.Services
{
    public static class InvoicePdfGenerator
    {
        private const string PaymentBankName = "MB Bank - Ngan hang TMCP Quan doi";
        private const string PaymentAccountName = "VU LE DUY";
        private const string PaymentAccountNumber = "VQRQAKJRY6534";
        private const string PaymentQrBaseUrl = "https://img.vietqr.io/image/MB-VQRQAKJRY6534-compact2.png";

        public static byte[] Generate(
            string invoiceNo,
            string orderCode,
            string customerName,
            string? contactName,
            string? address,
            string? taxCode,
            DateTime issueDate,
            DateTime dueDate,
            List<(string Type, string Desc, decimal Amt)> charges,
            decimal subTotal,
            decimal discount,
            decimal vatRate,
            decimal vatAmount,
            decimal total)
        {
            var transferContent = $"SmartLog {invoiceNo}";
            var qrUrl = BuildVietQrUrl(total, transferContent);
            var lines = new List<string>
            {
                "SMARTLOG AI - LOGISTICS INVOICE",
                "--------------------------------------------------",
                $"Invoice Number : {invoiceNo}",
                $"Order Code     : {orderCode}",
                $"Issue Date     : {issueDate:dd/MM/yyyy}",
                $"Due Date       : {dueDate:dd/MM/yyyy}",
                "",
                "SMARTLOG AI INFORMATION:",
                "  SmartLog AI - Warehouse Management",
                "  Address: Tan Binh District, Ho Chi Minh City",
                "  Email  : smartlogai2026@gmail.com",
                "",
                "CUSTOMER BILL TO:",
                $"  Company : {customerName}",
                $"  Contact : {contactName ?? "N/A"}",
                $"  Address : {address ?? "N/A"}",
                $"  Tax Code: {taxCode ?? "N/A"}",
                "",
                "SERVICE CHARGES:",
                string.Format("  {0,-25} | {1,16}", "Charge", "Amount (VND)"),
                "  --------------------------------------------------",
            };

            foreach (var c in charges)
            {
                var label = string.IsNullOrWhiteSpace(c.Desc) ? c.Type : $"{c.Type} - {c.Desc}";
                if (label.Length > 25) label = label.Substring(0, 22) + "...";
                lines.Add(string.Format("  {0,-25} | {1,16:N0}", label, c.Amt));
            }

            lines.AddRange(new[]
            {
                "  --------------------------------------------------",
                string.Format("  {0,-25} | {1,16:N0}", "Subtotal", subTotal),
                string.Format("  {0,-25} | {1,16:N0}", "Discount", -discount),
                string.Format("  {0,-25} | {1,16:N0}", $"VAT ({vatRate * 100:N0}%)", vatAmount),
                "  --------------------------------------------------",
                string.Format("  {0,-25} | {1,16:N0}", "TOTAL AMOUNT", total),
                "  --------------------------------------------------",
                "",
                "PAYMENT / VIETQR INFORMATION:",
                $"  Bank          : {PaymentBankName}",
                $"  Account Name  : {PaymentAccountName}",
                $"  Account No    : {PaymentAccountNumber}",
                $"  Amount        : {total:N0} VND",
                $"  Content       : {transferContent}",
                "  QR Link       :",
                $"  {qrUrl}",
                "",
                "Please use the exact transfer content above so SmartLog AI can reconcile payment automatically.",
                "Thank you for choosing SmartLog AI."
            });

            return SimplePdfWriter.Write(lines.Select(ToPdfText).ToList());
        }

        private static string BuildVietQrUrl(decimal amount, string transferContent)
        {
            var roundedAmount = decimal.ToInt32(decimal.Round(Math.Max(0, amount), 0));
            return $"{PaymentQrBaseUrl}?amount={roundedAmount}&addInfo={Uri.EscapeDataString(transferContent)}&accountName={Uri.EscapeDataString(PaymentAccountName)}";
        }

        private static string ToPdfText(string value)
        {
            if (value == null) return string.Empty;
            var normalized = value.Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder();
            foreach (var ch in normalized)
            {
                var category = CharUnicodeInfo.GetUnicodeCategory(ch);
                if (category == UnicodeCategory.NonSpacingMark) continue;
                if (ch == 'đ' || ch == 'Đ') builder.Append('d');
                else builder.Append(ch <= 126 ? ch : ' ');
            }
            return builder.ToString().Normalize(NormalizationForm.FormC);
        }

        private static class SimplePdfWriter
        {
            public static byte[] Write(List<string> lines)
            {
                var content = BuildContent(lines);
                var objects = new List<string>
                {
                    "<< /Type /Catalog /Pages 2 0 R >>",
                    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
                    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
                    "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>",
                    $"<< /Length {Encoding.ASCII.GetByteCount(content)} >>\nstream\n{content}\nendstream"
                };

                using var stream = new MemoryStream();
                using var writer = new StreamWriter(stream, Encoding.ASCII, leaveOpen: true);
                writer.WriteLine("%PDF-1.4");
                var offsets = new List<long> { 0 };
                for (var i = 0; i < objects.Count; i++)
                {
                    writer.Flush();
                    offsets.Add(stream.Position);
                    writer.WriteLine($"{i + 1} 0 obj");
                    writer.WriteLine(objects[i]);
                    writer.WriteLine("endobj");
                }

                writer.Flush();
                var xref = stream.Position;
                writer.WriteLine("xref");
                writer.WriteLine($"0 {objects.Count + 1}");
                writer.WriteLine("0000000000 65535 f ");
                foreach (var offset in offsets.Skip(1))
                {
                    writer.WriteLine($"{offset:0000000000} 00000 n ");
                }
                writer.WriteLine("trailer");
                writer.WriteLine($"<< /Size {objects.Count + 1} /Root 1 0 R >>");
                writer.WriteLine("startxref");
                writer.WriteLine(xref);
                writer.WriteLine("%%EOF");
                writer.Flush();
                return stream.ToArray();
            }

            private static string BuildContent(List<string> lines)
            {
                var builder = new StringBuilder();
                builder.AppendLine("BT");
                builder.AppendLine("/F1 9 Tf");
                builder.AppendLine("36 806 Td");
                foreach (var line in lines.Take(52))
                {
                    builder.AppendLine($"({Escape(line)}) Tj");
                    builder.AppendLine("0 -14 Td");
                }
                builder.AppendLine("ET");
                return builder.ToString();
            }

            private static string Escape(string value)
            {
                return value.Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");
            }
        }
    }
}