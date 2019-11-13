////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Using Variables///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var abhRequest = '12 Orders Of 50 Kilograms';
var material = 'Alpha GPC 50%';







//jQuery time
var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches
var form = $('#msform');

	function validateForm1()
	{
		var a= document.getElementById('moqIn').value;
		var b=ddocument.getElementById('ammount').value;
		var c=document.getElementById('priceIn').value;
		
		if (a==null || a=="",b==null || b=="",c==null || c=="")
		{
			console.log("Please Fill All Required Field");
			return false;
		}
		else{
			return true;
		}
	}
	function validateForm2()
	{
		var a=document.forms["Form"]["answer_a"].value;
		var b=document.forms["Form"]["answer_b"].value;
		var c=document.forms["Form"]["answer_c"].value;
		var d=document.forms["Form"]["answer_d"].value;
		if (a==null || a=="",b==null || b=="",c==null || c=="",d==null || d=="")
		{
			alert("Please Fill All Required Field");
			return false;
		}
		else{
			return true;
		}
	}
		



	$(".next").click(function(){
			if(animating) return false;
			animating = true;
			
			current_fs = $(this).parent().parent();
			next_fs = $(this).parent().parent().next();
			
			
			//show the next fieldset
			next_fs.show(); 
			//hide the current fieldset with style
			current_fs.animate({opacity: 0}, {
				step: function(now, mx) {
					//as the opacity of current_fs reduces to 0 - stored in "now"
					//1. scale current_fs down to 80%
					scale = 1 - (1 - now) * 0.2;
					//2. bring next_fs from the right(50%)
					left = (now * 50)+"%";
					//3. increase opacity of next_fs to 1 as it moves in
					opacity = 1 - now;
					current_fs.css({
						'transform': 'scale('+scale+')',
						'position': 'absolute'
					});
					next_fs.css({'left': left, 'opacity': opacity});
				}, 
				duration: 800, 
				complete: function(){
					current_fs.hide();
					animating = false;
				}, 
				//this comes from the custom easing plugin
				transition: 'easeInOutBack'
			});
	});


	$(".previous").click(function(){
		if(animating) return false;
		animating = true;
		
		current_fs = $(this).parent().parent();
		previous_fs = $(this).parent().parent().prev();
		
		
		//show the previous fieldset
		previous_fs.show(); 
		//hide the current fieldset with style
		current_fs.animate({opacity: 0}, {
			step: function(now, mx) {
				//as the opacity of current_fs reduces to 0 - stored in "now"
				//1. scale previous_fs from 80% to 100%
				scale = 0.8 + (1 - now) * 0.2;
				//2. take current_fs to the right(50%) - from 0%
				left = ((1-now) * 50)+"%";
				//3. increase opacity of previous_fs to 1 as it moves in
				opacity = 1 - now;
				current_fs.css({'left': left});
				previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
			}, 
			duration: 800, 
			complete: function(){
				current_fs.hide();
				animating = false;
			}, 
			//this comes from the custom easing plugin
			transition: 'easeInOutBack'
		});
	});

	console.log('hiiii')


	$('#payType').on('change', function() {
		if ( this.value == 'terms')
		{
			$("#terms").slideDown();
			$("#shipdateSelect").slideDown();
			
		}
		else if (this.value == 'advancePay') {
				$("#terms").slideUp();
				$("#shipdateSelect").slideUp();
			
		}
		});


		$(document).ready(function(){
			$('#checkboxID').change(function(){
				if(this.checked)
					$('#dateSelect').fadeOut('slow');
				else
					
					$('#dateSelect').fadeIn('slow');
			});
		});