using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Settings
{
    public class AmadeusSettings
    {
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string BaseUrl { get; set; } = "https://test.api.amadeus.com";
    }
}
