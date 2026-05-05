FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY CleanArchitecture.sln ./
COPY CleanArchitecture/CleanArchitecture.Application/CleanArchitecture.Core.csproj CleanArchitecture/CleanArchitecture.Application/
COPY CleanArchitecture/CleanArchitecture.Infrastructure/CleanArchitecture.Infrastructure.csproj CleanArchitecture/CleanArchitecture.Infrastructure/
COPY CleanArchitecture/CleanArchitecture.WebApi/CleanArchitecture.WebApi.csproj CleanArchitecture/CleanArchitecture.WebApi/

RUN dotnet restore CleanArchitecture/CleanArchitecture.WebApi/CleanArchitecture.WebApi.csproj

COPY . ./
RUN dotnet publish CleanArchitecture/CleanArchitecture.WebApi/CleanArchitecture.WebApi.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish ./
ENTRYPOINT ["dotnet", "CleanArchitecture.WebApi.dll"]
