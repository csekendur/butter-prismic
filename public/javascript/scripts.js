// Let's set up a function that shows our scroll-to-top button if we scroll beyond the height of the initial window.

const scrollFunc = () => {

    const scrollToTopButton = document.getElementById('js-top');
    // Get the current scroll value
    let y = window.scrollY;
    
    // If the scroll value is greater than the window height, let's add a class to the scroll-to-top button to show it!
    if (y > 0) {
      scrollToTopButton.className = "top-link show";
    } else {
      scrollToTopButton.className = "top-link hide";
    }
  };

  window.addEventListener("scroll", scrollFunc);

$(document).ready(function() {
  Weather.setApiKey("186a4121f9d2a98d277362cd4add0547");
  Weather.getCurrent("Queens", function(current) {
    var w = Weather.kelvinToFahrenheit(current.temperature());
    $(".weather").html(Math.round(w) + "&#176; F");
  });

  $("#js-top").on("click", function() {
    $("body").animate( { scrollTop:0, scrollLeft:0 }, 1000 );
    return false;
  });

  $(".popup-slider").on('beforeChange', scrollToTop);

  $(".popup-slider").slick({
    dots: false,
    infinite: true,
    slidesToShow: 1,
    adaptiveHeight: true,
    draggable: false,
    swipe: false
  });

  if (document.location.hash === '#work') {
    const workSection = document.getElementsByClassName('index-work')[0];
    const workTop = workSection.getBoundingClientRect().top;
    scrollTo(workTop);
  }

  $(".dot").mouseenter(function() {
    $(this).addClass("dot-hovered");
  });

  function addDots() {
    const intervalId = setInterval(() => {
      const dots = $(".dot").not(".dot-hovered");
      if (dots.length === 0) {
        clearInterval(intervalId);
        setTimeout(removeDots, 2000);
        return;
      }
      const dot = getRandom(dots);
      $(dot).addClass("dot-hovered");
    }, 100);
  }

  function removeDots() {
    const intervalId = setInterval(() => {
      const dots = $(".dot.dot-hovered");
      if (dots.length === 0) {
        clearInterval(intervalId);
        setTimeout(addDots, 2000);
        return;
      }
      const dot = getRandom(dots);
      $(dot).removeClass("dot-hovered");
    }, 100);
  }

  if (isMobile()) {
    addDots();
  }

  const $upArrow = $(".up-arrow");
  $(window).on("scroll", function() {
      var scrollPos = $(window).scrollTop();
      if (scrollPos <= 0) {
          $upArrow.addClass("hidden");
      } else {
          $upArrow.removeClass("hidden");
      }
  });

  $upArrow.each(function() {
    $(this).click(function() {
        $('html,body').animate({ scrollTop: 0 }, 400);
        return false;
    });
  });

  const $workLink = $('#work-link');
  const $workSection = $('.index-work');
  $workLink.click(function() {
    $('html, body').animate({
      scrollTop: ($workSection.offset().top)
    }, 500);
  });
});

document.addEventListener("touchstart", function(){}, true);

function scrollTo(height) {
  document.body.scrollTop = document.documentElement.scrollTop = height;
}

function scrollToTop() {
  scrollTo(0);
}

function isMobile() {
   return window.innerWidth <= 800;
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function openPopup(element) {
  $(".dots").addClass("hidden");
  $(element).removeClass("hidden");
  window.location.hash = element.id;
  scrollToTop();
}

function closePopup() {
  $(".dots").removeClass("hidden");
  $(".popup").addClass("hidden");
  window.location.hash = "";
}
