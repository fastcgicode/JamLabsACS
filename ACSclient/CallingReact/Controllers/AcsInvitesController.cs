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
    public class AcsInvitesController : ControllerBase
    {
        private readonly AcsUserContext _context;

        public AcsInvitesController(AcsUserContext context)
        {
            _context = context;
        }

        // GET: api/AcsInvites
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AcsInvite>>> GetAcsInvite()
        {
            return await _context.AcsInvite.ToListAsync();
        }

        // GET: api/AcsInvites/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AcsInvite>> GetAcsInvite(long id)
        {
            var acsInvite = await _context.AcsInvite.FindAsync(id);

            if (acsInvite == null)
            {
                return NotFound();
            }

            return acsInvite;
        }

        // PUT: api/AcsInvites/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAcsInvite(long id, AcsInvite acsInvite)
        {
            if (id != acsInvite.id)
            {
                return BadRequest();
            }

            _context.Entry(acsInvite).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AcsInviteExists(id))
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

        // POST: api/AcsInvites
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<AcsInvite>> PostAcsInvite(AcsInvite acsInvite)
        {
            _context.AcsInvite.Add(acsInvite);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAcsInvite", new { id = acsInvite.id }, acsInvite);
        }

        // DELETE: api/AcsInvites/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAcsInvite(long id)
        {
            var acsInvite = await _context.AcsInvite.FindAsync(id);
            if (acsInvite == null)
            {
                return NotFound();
            }

            _context.AcsInvite.Remove(acsInvite);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AcsInviteExists(long id)
        {
            return _context.AcsInvite.Any(e => e.id == id);
        }
    }
}
