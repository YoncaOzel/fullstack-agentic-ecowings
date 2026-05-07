using MediatR;
using System;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using System.Globalization;

namespace CleanArchitecture.Core.Features.Flights.Commands.BookFlight
{
    public class BookFlightCommand : IRequest<int> // ticketId döner
    {
        public string FlightNumber { get; set; }
        public String DepartureAirportCode { get; set; }
        public String DestinationAirportCode { get; set; }
        public string DepartureTime { get; set; } // String olarak değişti
        public string EstimatedArrivalTime { get; set; } // String olarak değişti
        public decimal Price { get; set; }
        public string AirlineCode { get; set; }
        public string UserEmail { get; set; }
        public bool IsDiscounted { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public decimal? DiscountRate { get; set; }

        public class BookFlightCommandHandler : IRequestHandler<BookFlightCommand, int>
        {
            private readonly IGenericRepositoryAsync<Flight> _flightRepository;
            private readonly IGenericRepositoryAsync<Ticket> _ticketRepository;
            private readonly IGenericRepositoryAsync<User> _userRepository;
            private readonly IGenericRepositoryAsync<Airline> _airlineRepository;

            public BookFlightCommandHandler(
                IGenericRepositoryAsync<Flight> flightRepository,
                IGenericRepositoryAsync<Ticket> ticketRepository,
                IGenericRepositoryAsync<User> userRepository,
                IGenericRepositoryAsync<Airline> airlineRepository)
            {
                _flightRepository = flightRepository;
                _ticketRepository = ticketRepository;
                _userRepository = userRepository;
                _airlineRepository = airlineRepository;
            }

            public async Task<int> Handle(BookFlightCommand request, CancellationToken cancellationToken)
            {
                // 1. Airline'ı airline code'a göre bul
                var airline = await _airlineRepository.GetAllAsync();
                var selectedAirline = airline.FirstOrDefault(a => a.AirlineCode == request.AirlineCode);
                if (selectedAirline == null)
                {
                    selectedAirline = new Airline
                    {
                        AirlineCode = request.AirlineCode ?? "UNKNOWN",
                        Name = request.AirlineCode ?? "Unknown Airline",
                        Country = "Unknown"
                    };

                    await _airlineRepository.AddAsync(selectedAirline);
                }

                // 2. User'ı email'e göre bul
                var users = await _userRepository.GetAllAsync();
                var user = users.FirstOrDefault(u => u.Email == request.UserEmail);
                if (user == null)
                {
                    throw new Exception($"User with email {request.UserEmail} not found");
                }

                // 3. Tarihleri parse et ve UTC'ye çevir
                DateTime departureDateTime = ParseDateTimeToUtc(request.DepartureTime);
                DateTime arrivalDateTime = ParseDateTimeToUtc(request.EstimatedArrivalTime);

                // 4. Flight oluştur
                var flight = new Flight
                {
                    FlightNumber = request.FlightNumber,
                    DepartureAirportCode = request.DepartureAirportCode,
                    DestinationAirportCode = request.DestinationAirportCode,
                    DepartureTime = departureDateTime,
                    EstimatedArrivalTime = arrivalDateTime,
                    Price = request.Price,
                    AirlineId = selectedAirline.Id
                };

                await _flightRepository.AddAsync(flight);

                // 5. Ticket oluştur
                var ticket = new Ticket
                {
                    PassengerId = user.Id,
                    FlightId = flight.Id,
                    BookingDate = DateTime.UtcNow,
                    IsPaid = false,
                    Price = request.Price,
                    IsDiscounted = request.IsDiscounted,
                    DiscountedPrice = request.DiscountedPrice,
                    DiscountRate = request.DiscountRate
                };

                await _ticketRepository.AddAsync(ticket);

                return ticket.Id;
            }

            /// <summary>
            /// String tarih değerini DateTime'a çevirir ve UTC'ye normalize eder.
            /// Formatlar: ISO 8601 (2024-06-15T10:00:00 veya 2024-06-15T10:00:00Z)
            /// </summary>
            private DateTime ParseDateTimeToUtc(string dateTimeString)
            {
                if (string.IsNullOrWhiteSpace(dateTimeString))
                {
                    throw new ArgumentException("Date time string cannot be null or empty");
                }

                DateTime parsedDate;

                // ISO 8601 formatlarını dene
                string[] formats = new[]
                {
                    "yyyy-MM-ddTHH:mm:ss",      // 2024-06-15T10:00:00
                    "yyyy-MM-ddTHH:mm:ssZ",     // 2024-06-15T10:00:00Z
                    "yyyy-MM-ddTHH:mm:ss.fff",  // 2024-06-15T10:00:00.123
                    "yyyy-MM-ddTHH:mm:ss.fffZ", // 2024-06-15T10:00:00.123Z
                };

                // DateTime.TryParse ile esnek parsing
                if (DateTime.TryParse(dateTimeString, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out parsedDate))
                {
                    // Eğer zaten UTC ise olduğu gibi döndür
                    if (parsedDate.Kind == DateTimeKind.Utc)
                    {
                        return parsedDate;
                    }

                    // Eğer Local veya Unspecified ise UTC'ye çevir
                    if (parsedDate.Kind == DateTimeKind.Local)
                    {
                        return parsedDate.ToUniversalTime();
                    }

                    // Unspecified ise UTC olarak kabul et
                    return DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);
                }

                // TryParseExact ile specific format parsing
                if (DateTime.TryParseExact(dateTimeString, formats, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out parsedDate))
                {
                    return DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);
                }

                throw new FormatException($"Invalid date time format: {dateTimeString}. Expected ISO 8601 format (e.g., 2024-06-15T10:00:00 or 2024-06-15T10:00:00Z)");
            }
        }
    }
}
