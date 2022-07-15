using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CallingReact.Models
{
    public class AcsUser
    {
        [Key]
        public string userName { get; set; }
        public string connectionId { get; set; }
        public string name { get; set; }
    }
}