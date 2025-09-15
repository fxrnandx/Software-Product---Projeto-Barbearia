using System.Security.Cryptography;
using System.ComponentModel.DataAnnotations;

namespace BarberShopApi.Domain.Models.Logins
{
  public class LoginInputModel
  {
    const int keySize = 64;
    const int iterations = 350000;
    HashAlgorithmName hashAlgorithm = HashAlgorithmName.SHA512;

    [Required]
    [EmailAddress]
    public required string Email { get; set; }
    [Required]
    [MinLength(6)]
    public required string Password { get; set; }
    public string? Salt { get; set; }
    public int? Id { get; set; }

    public LoginInputModel()
    {
      Salt = Convert.ToHexString(RandomNumberGenerator.GetBytes(keySize));
    }

    public string HashPassword()
    {
      var pbkdf2 = Rfc2898DeriveBytes.Pbkdf2(Password, Convert.FromHexString(Salt!), iterations, hashAlgorithm, keySize);
      return Convert.ToHexString(pbkdf2);
    }

  }
}
