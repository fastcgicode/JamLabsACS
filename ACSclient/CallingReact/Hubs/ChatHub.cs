using Microsoft.AspNetCore.SignalR;
using System.Security.Principal;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CallingReact.Models;

namespace CallingReact.Hubs
{
    public class ChatHub : Hub
    {
        private readonly AcsUserContext _context;

        public ChatHub(AcsUserContext context)
        {
            _context = context;
        }

        public async Task invite(string user, string from, string groupId)
        {
            await Clients.All.SendAsync("inviteReceived", user, from, groupId);
            AcsInvite i = new AcsInvite();
            i.userName = from;
            i.invitedUser = user;
            i.groupId = groupId;
            _context.AcsInvites.Add(i);
            await _context.SaveChangesAsync();
        }
        public async Task available(string username, string name)
        {
            await Clients.All.SendAsync("availableReceived", username);
            if (_context != null)
            {
                AcsUser u = new AcsUser();
                u.connectionId = Context.ConnectionId;
                u.userName = username;
                u.name = name;
                _context.AcsUsers.Add(u);
                await _context.SaveChangesAsync();
            }
        }
        public async Task unavailable(string username)
        {
            await Clients.All.SendAsync("unavailableReceived", username);
            if (_context != null)
            {
                var acsUser = await _context.AcsUsers.FindAsync(username);
                if (acsUser != null)
                {
                    _context.AcsUsers.Remove(acsUser);
                    await _context.SaveChangesAsync();
                }
            }
        }
    }
}