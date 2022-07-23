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
    public class UserInvitesController : ControllerBase
    {
        private readonly UserInvitesContext _context;

        public UserInvitesController(UserInvitesContext context)
        {
            _context = context;
        }

        // GET: api/UserInvites
        [HttpGet]
        public ActionResult<List<UserInvite>> UserInvites()
        {
            var r = from ui in _context.UserInvites
                    select ui;
            return r.ToList();
        }

        // GET: api/UserInvites
        [HttpGet("available/{username}/{name}/{connectionId}")]
        public ActionResult<string> Available(string username, string name, string connectionId)
        {
            var userInvites = from userinvite in _context.UserInvites
                              where userinvite.userName == username && userinvite.invitedUser == ""
                              select userinvite;
            if (userInvites.ToList().Count == 0)
            {
                UserInvite userinv = new UserInvite();
                userinv.userName = username;
                userinv.name = name;
                userinv.invitedUser = "";
                userinv.groupId = "";
                userinv.connectionId = connectionId;
                userinv.isInCall = "online";
                _context.UserInvites.Add(userinv);
                _context.SaveChanges();
            }
            return NoContent();
        }

        // GET: api/UserInvites
        [HttpGet("{username}")]
        public ActionResult<string> Unavailable(string username)
        {
            var userInvites = from userinvite in _context.UserInvites
                              where userinvite.userName == username
                              select userinvite;
            foreach (UserInvite i in userInvites.ToList())
            {
                _context.UserInvites.Remove(i);
            }
            _context.SaveChanges();
            return NoContent();
        }

        // GET: api/UserInvites
        [HttpGet("{username}/{name}/{invitedUser}/{groupId}")]
        public ActionResult<string> Invite(string username, string name, string invitedUser, string groupId)
        {
            var userInvites = from userinvite in _context.UserInvites
                              where userinvite.userName == username && userinvite.invitedUser == invitedUser
                              select userinvite;

            if (userInvites.ToList().Count > 0)
            {
                userInvites.ToList()[0].groupId = groupId;
                _context.UserInvites.Update(userInvites.ToList()[0]);
            }
            else
            {
                UserInvite userinvite = new UserInvite();
                userinvite.userName = username;
                userinvite.name = name;
                userinvite.invitedUser = invitedUser;
                userinvite.groupId = groupId;
                userinvite.connectionId = "";
                userinvite.isInCall = "online";
                _context.UserInvites.Add(userinvite);
            }

            _context.SaveChanges();
            return NoContent();
        }

        // GET: api/UserInvites/update
        [HttpGet("incall/{username}/{isInCall}")]
        public ActionResult<string> UpdateInCall(string username, string isInCall)
        {
            var userInvites = from userinvite in _context.UserInvites
                              where userinvite.userName == username
                              select userinvite;
            foreach (UserInvite i in userInvites.ToList())
            {
                i.isInCall = isInCall;
            }
            _context.SaveChanges();
            return NoContent();
        }
    }
}
