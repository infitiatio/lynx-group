using System.Net;
using TechTalk.SpecFlow;

namespace LynxGroup.BddTests.Bindings;

[Binding]
public sealed class AuthorizationBindings : IDisposable
{
    private readonly TestApiFactory factory = new();
    private HttpResponseMessage? response;

    [When("I request the protected health endpoint without authentication")]
    public async Task WhenIRequestTheProtectedHealthEndpointWithoutAuthenticationAsync()
    {
        using var client = factory.CreateTestClient();
        response = await client.GetAsync("/health");
    }

    [Then("the response status code should be 401 Unauthorized")]
    public void ThenTheResponseStatusCodeShouldBe401Unauthorized()
    {
        Assert.NotNull(response);
        Assert.Equal(HttpStatusCode.Unauthorized, response!.StatusCode);
    }

    public void Dispose()
    {
        response?.Dispose();
        factory.Dispose();
    }
}