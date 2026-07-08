using System.Threading.Tasks;

namespace BACKEND.Services
{
    public interface IS3StorageService
    {
        /// <summary>
        /// Uploads a file stream to S3 and returns the public object URL.
        /// </summary>
        Task<string> UploadAsync(Stream content, string fileName, string contentType, string keyPrefix);
    }
}
