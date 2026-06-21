using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;

namespace BACKEND.Services
{
    public class S3StorageService : IS3StorageService
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucket;
        private readonly string _region;

        public S3StorageService(IConfiguration configuration)
        {
            var aws = configuration.GetSection("AWS");
            var accessKey = aws["AccessKeyId"] ?? throw new InvalidOperationException("AWS:AccessKeyId is missing");
            var secretKey = aws["SecretKey"] ?? throw new InvalidOperationException("AWS:SecretKey is missing");
            _region = aws["Region"] ?? "ap-southeast-2";
            _bucket = aws["S3:Bucket"] ?? throw new InvalidOperationException("AWS:S3:Bucket is missing");

            var credentials = new BasicAWSCredentials(accessKey, secretKey);
            _s3Client = new AmazonS3Client(credentials, RegionEndpoint.GetBySystemName(_region));
        }

        public async Task<string> UploadAsync(Stream content, string fileName, string contentType, string keyPrefix)
        {
            var extension = Path.GetExtension(fileName);
            var key = $"{keyPrefix.TrimEnd('/')}/{Guid.NewGuid():N}{extension}";

            var request = new PutObjectRequest
            {
                BucketName = _bucket,
                Key = key,
                InputStream = content,
                ContentType = contentType
            };

            await _s3Client.PutObjectAsync(request);

            return $"https://{_bucket}.s3.{_region}.amazonaws.com/{key}";
        }
    }
}
