using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Exceptions
{
    internal class NotFoundException:Exception
    {
        public NotFoundException(String? message) : base(message)
        {

        }
    }
}
