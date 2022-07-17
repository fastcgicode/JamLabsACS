using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CallingReact.Models
{
    public class AcsInvite
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long id { get; set; }
        public string userName { get; set; }
        public string from { get; set; }
        public string groupId { get; set; }
    }
}