using System.Reflection;
using Autofac;
using BarberShopApi.Shared;
using Module = Autofac.Module;

namespace BarberShopApi.Helpers.Autofac
{
    public class ApplicationModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder
                .RegisterAssemblyTypes(
                    typeof(IService<>).Assembly,
                    Assembly.GetExecutingAssembly())
                .AsClosedTypesOf(typeof(IService<>))
                .InstancePerLifetimeScope();
            builder.RegisterType<HttpContextAccessor>().As<IHttpContextAccessor>().InstancePerLifetimeScope();
        }
    }

}
