namespace EduSphere.API.Extensions;

public static class EnvLoader
{
    public static void LoadRootEnv(ConfigurationManager configuration)
    {
        var currentDir = Directory.GetCurrentDirectory();
        var envFilePath = FindEnvFile(currentDir);

        if (envFilePath == null || !File.Exists(envFilePath))
        {
            return;
        }

        var lines = File.ReadAllLines(envFilePath);
        var inMemoryConfig = new Dictionary<string, string?>();

        foreach (var rawLine in lines)
        {
            var line = rawLine.Trim();
            if (string.IsNullOrWhiteSpace(line) || line.StartsWith('#'))
                continue;

            var equalsIndex = line.IndexOf('=');
            if (equalsIndex <= 0)
                continue;

            var key = line[..equalsIndex].Trim();
            var val = line[(equalsIndex + 1)..].Trim();

            // Strip surrounding quotes if present
            if ((val.StartsWith('"') && val.EndsWith('"')) || (val.StartsWith('\'') && val.EndsWith('\'')))
            {
                val = val[1..^1];
            }

            Environment.SetEnvironmentVariable(key, val);

            // Map friendly root .env keys to .NET configuration paths
            switch (key)
            {
                case "GOOGLE_CLIENT_ID":
                case "VITE_GOOGLE_CLIENT_ID":
                    inMemoryConfig["Google:ClientId"] = val;
                    break;
                case "SMTP_SERVER":
                    inMemoryConfig["EmailSettings:SmtpServer"] = val;
                    break;
                case "SMTP_PORT":
                    inMemoryConfig["EmailSettings:Port"] = val;
                    break;
                case "SMTP_SENDER_NAME":
                    inMemoryConfig["EmailSettings:SenderName"] = val;
                    break;
                case "SMTP_SENDER_EMAIL":
                    inMemoryConfig["EmailSettings:SenderEmail"] = val;
                    break;
                case "SMTP_USERNAME":
                    inMemoryConfig["EmailSettings:Username"] = val;
                    break;
                case "SMTP_PASSWORD":
                    inMemoryConfig["EmailSettings:Password"] = val;
                    break;
                case "SMTP_ENABLE":
                    inMemoryConfig["EmailSettings:EnableSmtp"] = val;
                    break;
                case "JWT_SECRET":
                    inMemoryConfig["Jwt:Secret"] = val;
                    break;
                case "JWT_ISSUER":
                    inMemoryConfig["Jwt:Issuer"] = val;
                    break;
                case "JWT_AUDIENCE":
                    inMemoryConfig["Jwt:Audience"] = val;
                    break;
                case "GEMINI_API_KEY":
                    inMemoryConfig["Gemini:ApiKey"] = val;
                    break;
                case "GEMINI_API_KEYS_POOL":
                    inMemoryConfig["Gemini:ApiKeysPool"] = val;
                    break;
                case "GEMINI_CHAT_MODEL":
                    inMemoryConfig["Gemini:ChatModel"] = val;
                    break;
                case "GEMINI_EMBEDDING_MODEL":
                    inMemoryConfig["Gemini:EmbeddingModel"] = val;
                    break;
                case "QDRANT_URL":
                    inMemoryConfig["Qdrant:Url"] = val;
                    break;
            }
        }

        if (inMemoryConfig.Count > 0)
        {
            configuration.AddInMemoryCollection(inMemoryConfig);
        }
    }

    private static string? FindEnvFile(string startPath)
    {
        var dir = new DirectoryInfo(startPath);
        while (dir != null)
        {
            var envPath = Path.Combine(dir.FullName, ".env");
            if (File.Exists(envPath))
                return envPath;

            dir = dir.Parent;
        }
        return null;
    }
}
