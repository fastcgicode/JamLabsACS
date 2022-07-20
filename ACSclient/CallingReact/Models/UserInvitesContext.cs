using Microsoft.EntityFrameworkCore;
using CallingReact.Models;

namespace CallingReact.Models
{
    public class UserInvitesContext : DbContext
    {
        public UserInvitesContext(DbContextOptions options)
            : base(options)
        {
        }

        public DbSet<UserInvite> UserInvites { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserInvite>().ToTable("UserInvites");
        }
    }
}