namespace BarberShopApi.Domain.Models.Shops
{
  public class ShopViewModel
  {
    public int? Id { get; set; }
    public required string Name { get; set; }
    public required decimal Latitude { get; set; }
    public required decimal Longitude { get; set; }
    public decimal? Distance { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }
    public string? City { get; set; }
    public string? Street { get; set; }
    public required string OpenAt { get; set; }
    public required string CloseAt { get; set; }
    public int? Rating { get; set; }
    public required string[]? WorkingDays { get; set; } = Array.Empty<string>();
    private string? number;
    public string? Number
    {
      get { return number; }
      set { number = String.IsNullOrWhiteSpace(value) ? "s/n" : value; }
    }
    public string? Logo { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }

    private string cnpj;
    public required string Cnpj
    {
      get { return cnpj; }
      set { cnpj = value.Replace(".", "").Replace("/", "").Replace("-", ""); }
    }

    public bool ValidateCnpj(string cnpj)
    {
        if (cnpj.Length != 14 || !cnpj.All(char.IsDigit))
            return false;

        // Verificar se todos os dígitos são iguais
        if (new string(cnpj[0], 14) == cnpj)
            return false;

        // Calcular primeiro dígito verificador
        int[] pesos1 = { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
        int soma1 = 0;
        for (int i = 0; i < 12; i++)
        {
            soma1 += int.Parse(cnpj[i].ToString()) * pesos1[i];
        }
        int primeiroDigitoVerificador = 11 - (soma1 % 11);
        if (primeiroDigitoVerificador >= 10)
            primeiroDigitoVerificador = 0;

        if (primeiroDigitoVerificador != int.Parse(cnpj[12].ToString()))
            return false;

        // Calcular segundo dígito verificador
        int[] pesos2 = { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
        int soma2 = 0;
        for (int i = 0; i < 13; i++)
        {
            soma2 += int.Parse(cnpj[i].ToString()) * pesos2[i];
        }
        int segundoDigitoVerificador = 11 - (soma2 % 11);
        if (segundoDigitoVerificador >= 10)
            segundoDigitoVerificador = 0;

        return segundoDigitoVerificador == int.Parse(cnpj[13].ToString());
    }
  }
}