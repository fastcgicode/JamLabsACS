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
    public class AcsUsersController : ControllerBase
    {
        private readonly AcsUserContext _context;

        public AcsUsersController(AcsUserContext context)
        {
            _context = context;
        }

        // GET: api/AcsUsers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AcsUser>>> GetAcsUsers()
        {
            return await _context.AcsUsers.ToListAsync();
        }

        // GET: api/AcsUsers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AcsUser>> GetAcsUser(string id)
        {
            var acsUser = await _context.AcsUsers.FindAsync(id);

            if (acsUser == null)
            {
                return NotFound();
            }

            return acsUser;
        }

        // PUT: api/AcsUsers/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAcsUser(string id, AcsUser acsUser)
        {
            if (id != acsUser.userName)
            {
                return BadRequest();
            }

            _context.Entry(acsUser).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AcsUserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/AcsUsers
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<AcsUser>> PostAcsUser(AcsUser acsUser)
        {
            _context.AcsUsers.Add(acsUser);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (AcsUserExists(acsUser.userName))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetAcsUser", new { id = acsUser.userName }, acsUser);
        }

        // DELETE: api/AcsUsers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAcsUser(string id)
        {
            var acsUser = await _context.AcsUsers.FindAsync(id);
            if (acsUser == null)
            {
                return NotFound();
            }

            _context.AcsUsers.Remove(acsUser);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AcsUserExists(string id)
        {
            return _context.AcsUsers.Any(e => e.userName == id);
        }
    }
}
