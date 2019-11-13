var $xBar = $(".x-bar"),
  $sideNav = $(".side-nav"),
  $menuIcon = $(".menu-icon"),
  $addUser = $(".addUser"),
  $removeUser = $(".removeUser"),
  $modVend = $(".modVend"),
  subButton = $("#formComplete")
  ;



$menuIcon.click(function() {
  $sideNav.css({
    left: 0
  });
  $menuIcon.fadeOut(5);
  $xBar.css({
    top: 300
  });
  if ($(window).width() < 767) {
    $sideNav.css({
      left: 0
    });
  }
  if ($(window).width() < 992) {
    $sideNav.css({
      width: 270
    });
  }
});



$xBar.click(function() {
  $sideNav.css({
    left: -307
  });
  $menuIcon.fadeIn(500);
  $xBar.css({
    top: -30,
   
  });
  if ($(window).width() < 767) {
    $sideNav.css({
      left: -100 + "%"
    });
  }
  if ($(window).width() < 991 && $(window).width() > 1199) {
    $sideNav.css({
      left: -270
    }) ;
  }
});




