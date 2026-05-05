using System;

namespace CleanArchitecture.Core.Exceptions
{
    public class UnauthorizedException : Exception
    {
        public UnauthorizedException() : base("You are not authorized.") { }

        public UnauthorizedException(string message) : base(message) { }
    }
}
