using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CallingReact.Models
{
    public class UserInvite
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long id { get; set; }
        public string userName { get; set; }
        public string name { get; set; }
        public string invitedUser { get; set; }
        public string groupId { get; set; }
        public string connectionId { get; set; }
    }
}