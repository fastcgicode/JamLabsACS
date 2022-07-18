using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CallingReact.Models;

namespace CallingReact.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AcsInvitesController : ControllerBase
    {
        private readonly AcsUserContext _context;

        public AcsInvitesController(AcsUserContext context)
        {
            _context = context;
        }

        // GET: api/AcsInvites
        [HttpGet("{id}")]
        public async Task<ActionResult<List<UserInvite>>> GetAcsInvites(string id)
        {
            var r = from users in _context.AcsUsers
                    join invites in _context.AcsInvites
                    on users.userName equals invites.userName
                    where invites.invitedUser==id || invites.invitedUser == ""
                    select new UserInvite
                    {
                        userName = users.userName,
                        name = users.name,
                        invitedUser=invites.invitedUser,
                        groupId = invites.groupId
                    };

            return r.ToList();
        }
    }
}
