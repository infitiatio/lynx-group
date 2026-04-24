using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace LynxGroup.BddTests.Bindings;

public sealed class TestApiFactory : WebApplicationFactory<Program>
{
    public TestApiFactory()
    {
        Environment.SetEnvironmentVariable("Authentication__Google__ClientId", "lynxgroup-google-client-id");
        Environment.SetEnvironmentVariable("Jwt__SigningKey", "lynxgroup-tests-signing-key-1234567890");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, configurationBuilder) =>
        {
            configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Port=5432;Database=lynxgroup_tests;Username=postgres;Password=postgres",
                ["Jwt:Issuer"] = "lynxgroup-tests",
                ["Jwt:Audience"] = "lynxgroup-tests",
                ["Jwt:SigningKey"] = "lynxgroup-tests-signing-key-1234567890",
                ["Jwt:ExpiryMinutes"] = "30",
                ["Authentication:Google:ClientId"] = "lynxgroup-google-client-id",
            });
        });
    }

    public HttpClient CreateTestClient()
    {
        return base.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("https://localhost"),
        });
    }
}