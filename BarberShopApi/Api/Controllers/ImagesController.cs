using BarberShopApi.Infrastructure.Images;
using Microsoft.AspNetCore.Mvc;

namespace Api.BarberShopApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly ImagesRepository _imagesRepository;

        public ImagesController(ImagesRepository imagesRepository)
        {
            _imagesRepository = imagesRepository;
        }

        [HttpPost]
        public async Task<IActionResult> PostTeste([FromBody] string file, string type)
        {
            var imageViewModel = await _imagesRepository.CreateImage(file, type);
            if (imageViewModel == null)
            {
                return StatusCode(500, "Error saving image");
            }
            return Ok(imageViewModel);
        }
    }
}

