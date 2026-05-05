namespace CleanArchitecture.Core.Settings
{
    public class PasswordResetSettings
    {
        public const string SectionName = "PasswordResetSettings";
        public int TokenExpirationMinutes { get; set; } = 60;
    }
}
