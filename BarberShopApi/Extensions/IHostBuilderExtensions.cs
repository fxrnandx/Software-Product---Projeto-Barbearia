using Autofac;
using Autofac.Extensions.DependencyInjection;
using BarberShopApi.Helpers.Autofac;

namespace BarberShopApi.Extensions;
public static class IHostBuilderExtensions
{
    public static IHostBuilder UseAutofac(this IHostBuilder hostBuilder)
    {
        hostBuilder.UseServiceProviderFactory(new AutofacServiceProviderFactory());
        hostBuilder.ConfigureContainer<ContainerBuilder>(builder =>
        {
            builder.RegisterModule(new ApplicationModule());
        });

        return hostBuilder;
    }
}