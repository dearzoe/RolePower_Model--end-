    <%@ include file='/main/head.jsp' %>
        <script src="<%=eafapppath %>/main/UserInterface/control.js" type="text/javascript"></script>
        <script src="<%=eafapppath %>/main/UserInterface/datagrid.js" type="text/javascript"></script>
        <script src="<%=eafapppath %>/main/AccessCtrl/RolePower_Model.js" type="text/javascript"></script>
        <div class="easyui-panel" data-options="region:'west',title:'',tools:'tlb_classTree'"
        style="width: 160px; padding: 0px;">
        <table id="acm_tree_model"></table>
        </div>
        <div data-options="region: 'center'" style="padding: 1px; height: 500px;">
        <iframe id="acm_tbs_model" name="acm_tbs_model" scrolling="no" frameborder="0" style="width: 99%; height: 99%;">
        </iframe>
        </div>
        <%@ include file='/main/footer.jsp' %>
