	<%@ include file='/main/head.jsp' %>
<script src="<%=eafapppath %>/main/UserInterface/control.js" type="text/javascript"></script>
<script src="<%=eafapppath %>/main/UserInterface/datagrid.js" type="text/javascript"></script>
<div data-options="region:'center',title:''" > 
<div id="tt" class="easyui-tabs" data-options="fit:true">
	<div title=<%= I18nHelper.GetLabel(request,"eaf_login_function")%> style="padding: 0px;">
	    <iframe id="tbs1" name="tbs1" scrolling="no" frameborder="0" style="width: 99%; height: 99%;"></iframe>
	</div>
	<div title=<%= I18nHelper.GetLabel(request,"mdm_acm_data")%> style="padding: 0px;">
	    <iframe id="tbs2" name="tbs2" scrolling="no" frameborder="0" style="width: 99%; height: 99%;"></iframe>
	</div>
	<div title=<%= I18nHelper.GetLabel(request,"eaf_login_rule")%> style="padding: 0px;">
	    <iframe id="tbs3" name="tbs3" scrolling='no' frameborder='0' style='width: 99%; height: 99%;'></iframe>
	</div>
	<div title=<%= I18nHelper.GetLabel(request,"eaf_login_model")%> style="padding: 0px;">
	<iframe id="acm_tbs_model" name="acm_tbs_model" scrolling='no' frameborder='0' style='width: 99%; height: 99%;'></iframe>
	</div>
</div>
</div>
<script type="text/javascript">
	// 角色id
	var roleId = eaf.getUrlParam('roleid');
	// 组织id
	var orgId = eaf.getUrlParam('orgid');
	$(function () {
		if (orgId == null) {
			orgId = '';
		}
	    $('#tbs1').attr("src", eaf.getEafAppPath()+"/main/AccessCtrl/RolePower_Portal.jsp?roleid=" + roleId + "&flg=class&orgid=" + orgId);
	    $('#tbs2').attr("src", eaf.getEafAppPath()+"/main/AccessCtrl/RolePower_Class.jsp?roleid=" + roleId + "&flg=class&orgid=" + orgId);
	    $('#tbs3').attr("src", eaf.getEafAppPath()+"/main/AccessCtrl/RolePower_Rules.jsp?roleid=" + roleId + "&flg=rule&orgid=" + orgId);
	    $('#acm_tbs_model').attr("src", eaf.getEafAppPath()+"/main/AccessCtrl/RolePower_Model.jsp?roleid=" + roleId + "&flg=rule&orgid=" + orgId);
	});
	// 返回选择行数据
    function getResult() {
         eaf.getIframWin(window.frames["tbs1"]).getResult();
         eaf.getIframWin(window.frames["tbs2"]).getResult();
         eaf.getIframWin(window.frames["tbs3"]).getResult();
		//获取模型页面的返回值
        var result = eaf.getIframWin(window.frames["acm_tbs_model"]).getResult();
		//提示
		var prompt;
		if(result.flag){
		   prompt="info";
		}else if(result.flag){
		   prompt="error";
		}
		$.messager.alert(result.inform,result.state,prompt)
    return 'EAFERR';
    }
</script>
<%@ include file='/main/footer.jsp' %>
