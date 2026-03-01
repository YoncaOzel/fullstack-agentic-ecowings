using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Entities
{
    public class Airport
    {
        public int Id { get; set; }
        public string Code { get; set; } // Havalimanı Kodu (IATA, ICAO)
        public string Name { get; set; } // Havalimanı Adı
        public string Country { get; set; } // Ülke
        public string City { get; set; } // Şehir
        public string TimeZone { get; set; } // Saat Dilimi
    }
}
