using Microsoft.EntityFrameworkCore;

namespace CallingReact.Models
{
    public class AcsUserContext : DbContext
    {
        public AcsUserContext(DbContextOptions options)
            : base(options)
        {
        }

        public DbSet<AcsUser> AcsUsers { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
        }
    }
}