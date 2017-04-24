$(function(){
	var off_top = $('.nav').offset().top;
	//1. 吸顶作用、及返回顶部的显示
	$(window).on('scroll',function(){
		var scr_top = $(window).scrollTop();
		
		if(scr_top > off_top){
			$(".nav").css({
				position:'fixed',
				top:0,
				boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
			})
			$(".nav_con_left img").css({
				opacity:1
			});
			//设置返回顶部显示
			$(".back").slideDown();
		}else{
			$(".nav").css({
				position:'absolute',
				top:100,
				'box-shadow':'none'
			});
			$(".nav_con_left img").css({
				opacity:0
			});
			$(".back").slideUp();
		}
	});
	//2.返回顶部-点击事件
	$(".back").on('click',function(){
		$("html body").animate({scrollTop:0});
	});
	
	//3.点击事项切换
	$(".con_top ul li").click(function(){
		$(this).addClass('cur').siblings().removeClass('cur');
		var index = $(this).index();
		$(".con_bottom").eq(index).addClass('active').siblings().removeClass('active');
	})
	
	var storeName = 'itemArray';//存储数据时的名字 key
	var itemArray = store.get(storeName,itemArray) || [];
	
	render_view();
	//4.添加按钮 添加任务
	$(".nav_con_right input[type=submit]").on('click',function(){
		event.preventDefault();
		var content = $(".nav_con_right input[type=text]").val();
		if($.trim(content) == ''){
			alert('输入内容不能为空');
			return;
		}
		
		var item = {
			title:'',
			content:'',
			isCheck:false,
            remind_time:'',
            is_notice:false
		};
		item.title = content;
		itemArray.push(item);
		render_view();
	});
	
	function render_view(){
		//缓存数据 到本地
		store.set(storeName,itemArray);
		$(".task").empty();
		
		$(".finish_task").empty();
		for(var i = 0;i < itemArray.length;i++){
			
			var obj = itemArray[i];
			if (obj == undefined ||!obj){//为了规范和严格要进行元素的判定
				
                continue;
            }else{
            	
				var tag = '<li data-index='+i+'><input type="checkbox"'+(obj.isCheck?'checked':'')+'/><span class="con_b_title">'+obj.title+'</span><span class="del">删除</span><span class="detail">详情</span></li>';
				if(obj.isCheck){
					$(".finish_task").prepend(tag);
				}else{
					$(".task").prepend(tag);
				}
            }
			
		}
/*		
		$.each(itemArray, function(index,item) {
			
//			if (item == undefined ||!item){//为了规范和严格要进行元素的判定
//              continue;//此时用这个JQ会报错
//          }
			var tag = '<li data-index='+index+'><input type="checkbox"'+(item.isCheck?'checked':'')+'/><span class="con_b_title">'+item.title+'</span><span class="del">删除</span><span class="detail">详情</span></li>';
			if(item.isCheck){
				$(".finish_task").prepend(tag);
			}else{
				$(".task").prepend(tag);
			}

		});*/
	}
	
	//5.点击删除 删除任务
	$("body").on('click','.del',function(){
		var item = $(this).parent();
		var index = item.data('index');
		
		if (index == undefined || !itemArray[index])return;
		delete itemArray[index];
		//删除节点
		item.slideUp(200,function(){
			item.remove();
		});
		store.set(storeName,itemArray);
	});
	
	//.6点击复选框 设置任务事项为完成状态
	$("body").on('click','input[type=checkbox]',function(){
		var item = $(this).parent();
		var index = item.data('index');
		if (index == undefined || !itemArray[index])return;
		var obj = itemArray[index];
		obj.isCheck = $(this).is(':checked');
		
		itemArray[index] = obj;
		
		render_view();
	});
	
	//7.点击详情设置 详情界面
	var cur_index = 0;
	$("body").on('click','.detail',function(){
		$(".mask").fadeIn();
		var obj = $(this).parent();
		var index = obj.data('index');
		cur_index = index;
		//alert(index);
		var item = itemArray[index];
		
		$(".m_deta .m_de_t_title").text(item.title);
		$(".m_de_bottom textarea").val(item.content);
		$(".m_de_bottom input[type=text]").val(item.remind_time);
		
	});
	//8.点击mask关闭
	$(".mask").click(function(){
		
		$(".mask").fadeOut();
	});
	//8.1点击关闭
	$(".m_close").click(function(){
		$(".mask").fadeOut();
	});
	$(".m_deta").click(function(){
		event.stopPropagation();
	});
	
	//9.设置本地化时间(设置中国时间)
	$.datetimepicker.setLocale('ch');
    //9.1给对应的标签设置时间选择器
    $("#date_time").datetimepicker();
    //10.点击更新 -更新数据
	$(".m_de_bottom input[type=submit]").click(function(){
		var content = $(".m_de_bottom textarea").val();
		var item = itemArray[cur_index];
		item.content = content;
		item.remind_time = $(".m_de_bottom input[type=text]").val();
		item.isCheck = false;
		//10.1把提醒设置为未提醒
		item.is_notice = false;
		//再赋回给原来的值  -- 更新
		itemArray[cur_index] = item;
		store.set(storeName,itemArray);
		render_view();
		$(".mask").fadeOut();
	});
	
	//11.设置时间提醒
	setInterval(function(){
		//11.1获取当前时间毫秒数
		var cur_time = (new Date()).getTime();
		
		for(var i = 0 ; i < itemArray.length; i++){
			var item = itemArray[i];
			
			if(item == undefined ||!item ||item.remind_time.length<1||item.is_notice){continue};
			//11.2获取提醒时间毫秒数
			var rem_time = (new Date(item.remind_time)).getTime();
			//11.3判断当前时间大于提醒时间 就开始提醒
			if(cur_time -rem_time >2){
				
				//11.4播放音乐
				$("video")[0].play();
				$("video").get(0).currentTime = 0;
				//11.5把提醒设置为已提醒
				item.is_notice = true;
				//11.6重新赋值
				itemArray[i]= item;
				//更新本地数据
				store.set(storeName,itemArray);
			}
		}
		
	},2000);
});