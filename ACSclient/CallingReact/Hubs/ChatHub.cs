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
        }
        public async Task available(string username)
        {
            await Clients.All.SendAsync("availableReceived", username, Context.ConnectionId);
            if (_context != null)
            {
                AcsUser u = new AcsUser();
                u.connectionId = Context.ConnectionId;
                u.userName = username;
                _context.AcsUsers.Add(u);
                await _context.SaveChangesAsync();
            }
        }
        public async Task unavailable(string username)
        {
            await Clients.All.SendAsync("unavailableReceived", username, Context.ConnectionId);
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