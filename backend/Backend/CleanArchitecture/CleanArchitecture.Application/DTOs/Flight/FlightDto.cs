using System.Collections.Generic;

namespace CleanArchitecture.Core.DTOs
{
    public class FlightDto
    {
        // Ana Uçuş Bilgileri (Özet)
        public string Departure { get; set; }
        public string Arrival { get; set; }
        public string DepartureTime { get; set; }
        public string ArrivalTime { get; set; }
        public string Carrier { get; set; } // Ana taşıyıcı
        public string FlightNumber { get; set; }
        public string Price { get; set; }
        public string Currency { get; set; }
        public string Date { get; set; }
        public string Duration { get; set; } // Toplam süre

        // Karbon Bilgisi
        public double CarbonEmission { get; set; }
        public string EmissionClass { get; set; }

        // ✅ YENİ: Aktarma Detayları (Segmentler)
        public List<FlightSegmentDto> Segments { get; set; } = new List<FlightSegmentDto>();
    }

    // Her bir uçuş bacağı için detay sınıfı
    public class FlightSegmentDto
    {
        public string Departure { get; set; }      // Nereden kalkıyor? (Örn: AYT)
        public string Arrival { get; set; }        // Nereye iniyor? (Örn: IST - Aktarma Noktası)
        public string DepartureTime { get; set; }
        public string ArrivalTime { get; set; }
        public string Carrier { get; set; }
        public string FlightNumber { get; set; }
        public string Duration { get; set; }       // Bu bacağın süresi
    }
}