﻿using Microsoft.EntityFrameworkCore;
using CallingReact.Models;

namespace CallingReact.Models
{
    public class AcsUserContext : DbContext
    {
        public AcsUserContext(DbContextOptions options)
            : base(options)
        {
        }

        public DbSet<AcsUser> AcsUsers { get; set; }
        public DbSet<AcsInvite> AcsInvites { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AcsUser>().ToTable("AcsUsers");
            modelBuilder.Entity<AcsInvite>().ToTable("AcsInvites");
        }
    }
}