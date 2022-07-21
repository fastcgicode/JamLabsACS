using Microsoft.AspNetCore.SignalR;
using System.Security.Principal;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CallingReact.Models;
using System.Linq;

namespace CallingReact.Hubs
{
    public class ChatHub : Hub
    {
        private readonly UserInvitesContext _context;

        public ChatHub(UserInvitesContext context)
        {
            _context = context;
        }

        public async Task invite(string invitedUser, string name, string username, string groupId)
        {
            var userInvites = from userinvite in _context.UserInvites
                              where userinvite.userName == invitedUser && userinvite.connectionId != ""
                              select userinvite;
            string connectionId = userInvites.ToList()[0].connectionId;
            await Clients.Client(connectionId).SendAsync("inviteReceived", invitedUser, username, groupId);
        }
        public async Task available(string username, string name)
        {
            await Clients.All.SendAsync("availableReceived", username, Context.ConnectionId);
        }
        public async Task unavailable(string username)
        {
            await Clients.All.SendAsync("unavailableReceived", username);
        }
    }
}