using Microsoft.AspNetCore.SignalR;
using System.Security.Principal;
using System.Threading.Tasks;

namespace CallingReact.Hubs
{
    public class ChatHub : Hub
    {
        ///public async Task NewMessage(long username, string message) =>
            ///await Clients.All.SendAsync("messageReceived", username, message);
            
        public async Task invite(string connectionId, string from, string groupId) =>
            await Clients.Client(connectionId).SendAsync("inviteReceived", from, groupId); 
        public async Task available(string username) =>
            await Clients.All.SendAsync("availableReceived", username, Context.ConnectionId);
        public async Task unavailable(string username) =>
            await Clients.All.SendAsync("unavailableReceived", username, Context.ConnectionId);
    }
}