// Backend/CleanArchitecture/CleanArchitecture.Application/DTOs/SearchFlightsWithBookingRequest/SearchFlightsWithBookingRequestDTO.cs
using CleanArchitecture.Core.DTOs.Flight;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.DTOs.SearchFlightsWithBookingRequest
{
    public class SearchFlightsWithBookingRequestDTO : IRequest<List<FlightDto>>
    {
        public string Origin { get; set; }
        public string Destination { get; set; }
        public string Date { get; set; }
        public int Adults { get; set; }
        public string TravelClass { get; set; }

        public class SearchFlightsWithBookingRequestHandler : IRequestHandler<SearchFlightsWithBookingRequestDTO, List<FlightDto>>
        {
            private readonly IFlightSearchService _flightSearchService;

            // Removed IEcoAgentService dependency from the constructor
            public SearchFlightsWithBookingRequestHandler(IFlightSearchService flightSearchService)
            {
                _flightSearchService = flightSearchService;
            }

            public async Task<List<FlightDto>> Handle(SearchFlightsWithBookingRequestDTO request, CancellationToken cancellationToken)
            {
                // Request goes directly to the active IFlightSearchService
                var flights = await _flightSearchService.SearchFlightsAsync(
                    request.Origin,
                    request.Destination,
                    request.Date,
                    request.Adults,
                    request.TravelClass
                );

                if (flights == null || flights.Count == 0)
                    return new List<FlightDto>();

                // EcoComparison calculations have been completely removed.
                // Returning flights directly.
                return flights;
            }
        }
    }
}