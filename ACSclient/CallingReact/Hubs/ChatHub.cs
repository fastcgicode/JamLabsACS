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
            await Clients.All.SendAsync("inviteReceived", invitedUser, username, groupId);
        }
        public async Task available(string username, string name)
        {
            await Clients.All.SendAsync("availableReceived", username);
        }
        public async Task unavailable(string username)
        {
            await Clients.All.SendAsync("unavailableReceived", username);
        }
    }
}