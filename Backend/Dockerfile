FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY CleanArchitecture/CleanArchitecture.Application/CleanArchitecture.Core.csproj \
     CleanArchitecture/CleanArchitecture.Application/
COPY CleanArchitecture/CleanArchitecture.Infrastructure/CleanArchitecture.Infrastructure.csproj \
     CleanArchitecture/CleanArchitecture.Infrastructure/
COPY CleanArchitecture/CleanArchitecture.WebApi/CleanArchitecture.WebApi.csproj \
     CleanArchitecture/CleanArchitecture.WebApi/

RUN dotnet restore CleanArchitecture/CleanArchitecture.WebApi/CleanArchitecture.WebApi.csproj

COPY . .
WORKDIR /src/CleanArchitecture/CleanArchitecture.WebApi
RUN dotnet publish CleanArchitecture.WebApi.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "CleanArchitecture.WebApi.dll"]
