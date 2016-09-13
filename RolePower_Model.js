/**
 * Created by huwenzhe on 2016/8/18.
 */
// 角色id
var roleId = eaf.getUrlParam('roleid');
// 部门id
var orgId = eaf.getUrlParam('orgid');
// 类元模型id
var clsId = '51D9A19482AFE43B895AEA9BA76CEFCD';
// 业务类id
var modelClsId = 'D5A2EEF068686A7A6FD26A9B54439F1E';
// 角色和对象权限类id
var objPowerClsId = '96EA17174ACBAA5BDE5500B46E329F24';
// 节点类型，'1'父类  '2'子类
var nodeType;
// 模型id
var modelId = eaf.getUrlParam('modelid');
// 构造数据权限列表
var dataDgData = [];
// 设置属性权限列表
var powerPData = [];
// 浏览操作id
var browseOpId = 'model000000000000000000000000001';
// 修改操作id
var updateOpId = 'model000000000000000000000000002';
// 添加操作id
var addOpId = 'model000000000000000000000000003';
// 冻结操作id
var frozenOpId = '00000000000000000000000000000007';
// 原始操作权限列表  数据结构 {"modelId1":{"0":{"key":"val"},"1":{},"2":{}},"modelId2":{}}
// 此json对象为三层，其中第一层的每个key都是一个模型的id，如model1，model2，值为第二层对象
// 第二层的key是操作类型，其中"0"为浏览，"1"为修改，"2"为冻结。值为第三层对象
// 第三层对象为当前模型的当前操作的信息明细，其中KEY=“EAF_ID”的值代表权限记录ID，KEY=“EAF_POWER”的值代表操作权限值，KEY=“EAF_NODETYPE”的值代表模型节点类型，KEY=“EAF_OPER”的值代表操作ID,KEY=“EAF_modelId”的值代表模型ID。
var hashDataDgOld = {};
// 保存数据权限列表  数据结构 {"modelId1":{"0":{"key":"val"} ,"1":{},"2":{}},"modelId2":{}}
// 此json对象为三层，其中第一层的每个key都是一个模型的id，如model1，model2，值为第二层对象
// 第二层的key是操作类型，其中"0"为浏览，"1"为修改，"2"为冻结。值为第三层对象
// 第三层对象中KEY=“EAF_POWER”的值代表操作权限值，KEY=“EAF_NODETYPE”的值代表模型节点类型，KEY=“EAF_OPER”的值代表操作ID,KEY=“EAF_modelId”的值代表模型ID。
var hashDataDgNew = {};
//保存数组对像
var operArraySave = [];
//删除数组对像
var delOperArray = [];
$(function () {
    //表格头
    var dataGridColumn = [[{
        field: 'EAF_OPER',
        title: eaf.getLabel("eaf_acm_operate"),
        rowspan: 2,
        width: 80,
        align: 'center'
    }, {title: eaf.getLabel("eaf_acm_accreditStatus"), colspan: 2, width: 300}],
        [{
            field: 'power_y',
            title: eaf.getLabel("eaf_acm_allow"),
            align: 'center',
            width: 170,
            formatter: function (value, row, index) {
                return checkBoxPower(row, 'power_y', 'y', modelId);
            }
        },
        {
            field: 'power_n',
            title: eaf.getLabel("eaf_acm_refuse"),
            align: 'center',
            width: 170,
            formatter: function (value, row, index) {
                return checkBoxPower(row, 'power_n', 'n', modelId);
            }
        }
        ]];
    //左边结构树
    $('#acm_tree_model').tree({
        url: eaf.getComboTreeUrl('ACM', 'GetSubModelTree') + '&clsid=' + modelClsId + '&arg={isContainChildClasses:0}',
        animate: true,
        checkbox: false,
        lines: true,
        onClick: function (node) {
            // 属性id
            modelId = node.id;
            // 判断节点类型
            if ($(this).tree('getRoot', node.target).domId != node.target.id) {
                nodeType = 2;
            } else {
                nodeType = node.target.nodeType;
            }
            dataDgData = [{EAF_OPER: eaf.getLabel("eaf_acm_browse"), 'EAF_ID': browseOpId},
                {EAF_OPER: eaf.getLabel("eaf_acm_modify"), 'EAF_ID': updateOpId},
                {EAF_OPER: eaf.getLabel("eaf_acm_add"), 'EAF_ID': addOpId},
                {EAF_OPER: eaf.getLabel("eaf_acm_frozen"), 'EAF_ID': frozenOpId}];
            // 加载页面数据权限列表
            loadDataPower(powerPData, modelId);
        }
    });
    //右边的表格
    $("#acm_tbs_model").datagrid({
        //设置选中没有背景颜色
        onClickRow: function (rowIndex, rowData) {
            $(this).datagrid('unselectRow', rowIndex);
        },
        fitColumns: true,
        align: 'center',
        disabled: true,
        columns: dataGridColumn,
        data: dataDgData
    })
});
/**
 *勾选复选框时设置复选框状态及将勾选的数据保存在缓存中
 * @param row  所选树对应的表格结构的所有对象
 * @param power  保证唯一性的字符串
 * @param n  权限（复选框）状态
 * @returns {string} 权限编辑框
 */
function checkBoxPower(row, power, n , modelId , operId) {
    return "<input class=\"" + modelId + power + operId + "\" id=\"" + power + row.EAF_ID + "\" onchange=\"saveOper(this,'" + n + "','" + row.EAF_ID + "','"+ modelId +"');\" type=\"checkbox\" value=\"" + row[power] + "\"" + ((row[power]) ? " checked=true " : "") + " >";
}
/**
 * 获取传入节点的数据权限集合
 * @param modelId  模型ID
 * @param nodeType  节点类型
 * @returns {Array}  所选节点的属性集合 数据格式：数据结构[{EAF_NODETYPE:""}{EAF_POWER:""}{EAF_OPER:""}...]
 */
function getOperData(modelId, nodeType) {
    // 设置的属性权限数组
    var powerPData = [];
    powerPData = hashDataDgNew[modelId];
        if (!powerPData) {
            //从数据库读取
            hashDataDgOld[modelId] = eaf.ajaxGet(eaf.getObjsToFrameUrl('AccessCtrl', 'GetOperList') + '&ruleid=' + modelId + '&roleid=' + roleId + '&clsid=' + clsId + '&orgid=' + orgId + '&flg=portal').rows;
            powerPData = hashDataDgOld[modelId];
        }
    return powerPData;
}
/**
 * 保存操作列表
 * @param obj  input对象
 * @param state  checkbox状态
 * @param operId  操作ID
 */
function saveOper(obj, state, operId, modelId) {
    // 设置允许和拒绝权限只能选择一个
    if ('y' == state && $(obj).is(":checked")) {
        $(obj).parent().parent().next().find("input").prop("indeterminate", false);
        if ($(obj).parent().parent().next().find("input").is(":checked")) {
            $(obj).parent().parent().next().find("input").attr("checked", false);
        }
    } else if ('n' == state && $(obj).is(":checked")) {
        $(obj).parent().parent().prev().find("input").prop("indeterminate", false);
        if ($(obj).parent().parent().prev().find("input").is(":checked")) {
            $(obj).parent().parent().prev().find("input").attr("checked", false);
        }
    }
    //保存操作权限列表
    var powerPData = [];
    upDataPower(dataDgData, powerPData);
    //原始操作权限列表对应的模型ID下的操作权限
    hashDataDgNew[modelId] = powerPData;
    if(operId == addOpId){
        return;
    }
    //获取业务类下的所有子节点属性
    var childNodes = getChildren(modelId);
    for(var operSaveIndex in childNodes) {
        //每个子节点的modelId
        var curModel=childNodes[operSaveIndex].EAF_ID;
        //获取input标签的ID
        var inputId="power_"+state+operId;
        //获取input标签
        var inputObj =$("#"+inputId);
        if(childNodes){
        saveOper(inputObj, state, operId, curModel);
        }
    }
}
/**
 * 加载权限数据
 * @param powerPData  [Array]所选类中所有对象集合
 * @param modelId  模型ID
 */
function loadDataPower(powerPData, modelId) {
    //清空保存数组对像
    operArraySave = [];
    //清空删除数组对像
    delOperArray = [];
    //所选节点的状态集合
    var powerPData = getOperData(modelId, nodeType);
    //判断是否是根目录，根目录有添加选项
    if (nodeType == 1) {
        dataDgData = [{EAF_OPER: eaf.getLabel("eaf_acm_browse"), 'EAF_ID': browseOpId},
            {EAF_OPER: eaf.getLabel("eaf_acm_modify"), 'EAF_ID': updateOpId},
            {EAF_OPER: eaf.getLabel("eaf_acm_add"), 'EAF_ID': addOpId},
            {EAF_OPER: eaf.getLabel("eaf_acm_frozen"), 'EAF_ID': frozenOpId}];
    } else if (nodeType == 2) {
        dataDgData = [{EAF_OPER: eaf.getLabel("eaf_acm_browse"), 'EAF_ID': browseOpId},
            {EAF_OPER: eaf.getLabel("eaf_acm_modify"), 'EAF_ID': updateOpId},
            {EAF_OPER: eaf.getLabel("eaf_acm_frozen"), 'EAF_ID': frozenOpId}];
    }
    //更新权限
    upDataPowers(dataDgData, powerPData);
    $('#acm_tbs_model').datagrid({
        data: dataDgData,
        onLoadSuccess: function (node, data) {
            // 节点不是属性时，查找属性组下所有属性
            if (nodeType != '2') {
                // 属性组授权状态集合
                var attrsPower = {};
                // 属性组下所有子节点
                var childNodes = getChildren(modelId);
                // 子节点id
                var childNodesId;
                // 子节点操作id
                var childOperId;
                // 子节点权限
                var childPower;
                // 所有子节点中允许的浏览权限的条数
                var brwY = 0;
                // 所有子节点中拒绝的浏览权限的条数
                var brwN = 0;
                // 所有子节点中允许的修改权限的条数
                var updY = 0;
                // 所有子节点中拒绝的修改权限的条数
                var updN = 0;
                // 所有子节点中允许的冻结权限的条数
                var frzY = 0;
                // 所有子节点中拒绝的冻结权限的条数
                var frzN = 0;
                // 子节点的长度
                var len = childNodes.length;
                for (var i = 0; i < len; i++) {
                    childNodesId = childNodes[i].EAF_ID;
                    //权限数据
                    var powerPData = getOperData(childNodesId, childNodes[i].NODETYPE);
                    for (var powerData in powerPData) {
                        childOperId = powerPData[powerData].EAF_OPER;
                        childPower = powerPData[powerData].EAF_POWER;
                        if (childOperId == browseOpId && childPower == 'Y') {
                            brwY++;
                        } else if (childOperId == browseOpId && childPower == 'N') {
                            brwN++;
                        } else if (childOperId == updateOpId && childPower == 'Y') {
                            updY++;
                        } else if (childOperId == updateOpId && childPower == 'N') {
                            updN++;
                        } else if (childOperId == frozenOpId && childPower == 'Y') {
                            frzY++;
                        } else if (childOperId == frozenOpId && childPower == 'N') {
                            frzN++;
                        }
                    }
                }
                // 属性组授权状态
                var status = '';
                // 设置浏览操作允许的状态
                status = getAttrStatus(len, brwY);
                attrsPower["power_y" + browseOpId] = status;
                // 设置浏览操作拒绝的状态
                status = getAttrStatus(len, brwN);
                attrsPower["power_n" + browseOpId] = status;
                // 设置修改操作允许的状态
                status = getAttrStatus(len, updY);
                attrsPower["power_y" + updateOpId] = status;
                // 设置修改操作拒绝的状态
                status = getAttrStatus(len, updN);
                attrsPower["power_n" + updateOpId] = status;
                // 设置冻结操作允许的状态
                status = getAttrStatus(len, frzY);
                attrsPower["power_y" + frozenOpId] = status;
                // 设置冻结操作拒绝的状态
                status = getAttrStatus(len, frzN);
                attrsPower["power_n" + frozenOpId] = status;
                // 设置浏览操作允许的状态
                setAttrCheckbox(attrsPower, 'power_y' + browseOpId, 'power_y' + browseOpId);
                // 设置浏览操作拒绝的状态
                setAttrCheckbox(attrsPower, 'power_n' + browseOpId, 'power_n' + browseOpId);
                // 设置修改操作允许的状态
                setAttrCheckbox(attrsPower, 'power_y' + updateOpId, 'power_y' + updateOpId);
                // 设置修改操作拒绝的状态
                setAttrCheckbox(attrsPower, 'power_n' + updateOpId, 'power_n' + updateOpId);
                // 设置冻结操作允许的状态
                setAttrCheckbox(attrsPower, 'power_y' + frozenOpId, 'power_y' + frozenOpId);
                // 设置冻结操作拒绝的状态
                setAttrCheckbox(attrsPower, 'power_n' + frozenOpId, 'power_n' + frozenOpId);
            }
        }
    });
    /**
     * 获取属性组授权状态(根节点时)
     * @param childLength  子节点个数
     * @param powerNums  子节点中有每个权限的状态的个数
     * @returns {string}  checkBox状态
     */
    function getAttrStatus(childLength, powerNums) {
        //状态
        var status = '';
        if (powerNums == 0) {
            //全不选
            status = "1";
        } else {
            //todo--begin：后台需要修改，待修改完调回；（20160901--）
            /*
             if (childLength == powerNums) {
             */
            if (childLength < powerNums || childLength == powerNums) {
            //todo--end
            //全选
            status = "0";
            } else {
            //不确定
            status = "2";
            }
        }
        return status;
    }
    /**
     * 设置属性权限状态
     * @param attrsPower  属性组授权状态集合
     * @param attrPowerId  属性授权ID
     * @param attrStatusId  属性授权状态ID
     */
    function setAttrCheckbox(attrsPower, attrPowerId, attrStatusId) {
        //checkbox值
        var attrStatusValue = attrsPower[attrPowerId];
        //checkbox状态
        var attrStatusCheck = $(eval(attrStatusId));
        if (attrStatusValue == '0') {
            // 全选
            attrStatusCheck.attr("checked", true);
        } else if (attrStatusValue == '1') {
            // 全不选
            attrStatusCheck.attr("checked", false);
        } else if (attrStatusValue == '2') {
            // 不确定
            attrStatusCheck.attr("checked", false);
            attrStatusCheck.prop("indeterminate", true);
        }
    }
}
/**
 * 构造操作权限列表
 * @param operPData   初始数据；[Array]所选类中所有对象集合
 * @param powerPData  遍历并保存操作权限列表的空数组；最终数据
 */
function upDataPower(operPData, powerPData) {
    for (var i = 0; i < operPData.length; i++) {
        //待赋值的每行空数据
        var operData = operPData[i];
        //每行数据ID
        var operId = operData.EAF_ID;
        //数据集合
        var powerData = {};
        powerData.EAF_OPER = operId;
        powerData.EAF_modelId = modelId;
        powerData.EAF_NODETYPE = nodeType;
        if ($(eval('power_y' + operId)).is(":checked")) {
            powerData.EAF_POWER = 'Y';
        } else if ($(eval('power_n' + operId)).is(":checked")) {
            powerData.EAF_POWER = 'N';
        } else {
            powerData.EAF_POWER = '';
        }
        powerPData.push(powerData);
    }
}
/**
 * 更新权限值
 * @param operPData  初始传入数据
 * @param powerPData  权限集合
 */
function upDataPowers(operPData, powerPData) {
    //选择节点为子节点并且初始值不为空
    if (operPData !== undefined && powerPData !== undefined) {
        for (var i = 0; i < operPData.length; i++) {
            //初始数据行
            var operData = operPData[i];
            for (var j = 0; j < powerPData.length; j++) {
                //返回数据行
                var powerData = powerPData[j];
                if (operData.EAF_ID == powerData.EAF_OPER) {
                    if ('Y' == powerData.EAF_POWER && operData.power_y == undefined || operData.power_y == '') {
                        operData.power_y = true;
                    }
                    if ('N' == powerData.EAF_POWER && operData.power_n == undefined || operData.power_n == '') {
                        operData.power_n = true;
                    }
                }
            }
        }
    }
}
/**
 * 获取旧的数据权限
 * @param hashModelId 模型ID
 * @param operType 模型ID下对应的操作对象 key为 "0":浏览 "1":修改 "2":冻结
 * @returns {*} 旧的数据权限 "" or "Y" or "N"
 */
function getOldPower(hashModelId , operType , operNewId) {
    //旧的权限以及操作权限ID
    var hash={};
    if (hashDataDgOld[hashModelId]) {
        for(var oper in hashDataDgOld[hashModelId]){
            if(hashDataDgOld[hashModelId][oper].EAF_OPER== operNewId){
                hash.hashOldPower = hashDataDgOld[hashModelId][oper].EAF_POWER;
                hash.hashId = hashDataDgOld[hashModelId][oper].EAF_ID;
                return hash;
            }
            hash.hashOldPower = ""
        }
    }
    if(!(hashDataDgOld[hashModelId] && hashDataDgOld[hashModelId][operType])){
        hash.hashOldPower = ""
    }
    return hash;
}
/**
 * 点击确定时向后台发送数据
 * @returns  返回值为一个对象：key分别为flag(传向父页面的判断弹窗权限) inform(弹窗提示信息标头)  state(弹窗提示信息成功或失败)
 */
function getResult() {
    //AJAX成功时候的返回值
    var result={};
    //新的操作ID
    var operNewId = '';
    //储存操作权限集合
    var operJson = {};
    //状态集合
    var nodeType = '';
    //历史数据ID
    var hashOldId = '';
    //新数据权限
    var hashNewPower = '';
    for (var newModelId in hashDataDgNew) {
        for (var newOperType in hashDataDgNew[newModelId]) {
            //获取新的权限
            hashNewPower = hashDataDgNew[newModelId][newOperType].EAF_POWER;
            //获取新的操作ID
            operNewId = hashDataDgNew[newModelId][newOperType].EAF_OPER;
            //从方法中调取旧的权限
            var hash = getOldPower(newModelId , newOperType , operNewId);
            //删除
            if (hashNewPower == "" && hash.hashOldPower !== "") {
                //获取旧的操作权限ID
                hashOldId = hashDataDgOld[newModelId][newOperType].EAF_ID;
                delOperArray.push(hashOldId);
            } else if(hashNewPower !== "" && hash.hashOldPower !== hashNewPower){
                operJson = {};
                //创建操作权限ID 在添加和修改时取值不同
                var hashId;
                if (hashNewPower != hash.hashOldPower && hash.hashOldPower != "") {
                    //获取权限记录ID(此ID为oldId)
                    hashId = hash.hashId;
                } else {
                    //获取权限记录ID(此ID为新获取)
                    hashId = eaf.guid();
                }
                if(hashNewPower!=""){
                operJson['EAF_ID'] = hashId;
                operJson['EAF_POWER'] = hashNewPower;
                operJson['EAF_ROLEID'] = roleId;
                operJson['EAF_CLSID'] = clsId;
                operJson['EAF_OPER'] = operNewId;
                operJson['EAF_ORGID'] = orgId;
                operJson['EAF_OBJID'] = newModelId;
                operArraySave.push(operJson);
                }
            }
        }
    }
    //ajax保存数据
    $.ajax({
        type: "POST",
        url: eaf.saveObjByIdToFrameUrl('AccessCtrl', 'SaveRolePower'),
        async: false,
        dataType: "json",
        data: {
            portalclsid: objPowerClsId,
            objarray: eaf.jsonToStr(operArraySave),
            delobjarray: eaf.jsonToStr(delOperArray)
        },
        success: function () {
            //清空数据列表
            hashDataDgOld = {};
            //清空数据列表
            hashDataDgNew = {};
            result.flag=true;
            result.inform=eaf.getLabel("eaf_acm_inform");
            result.state=eaf.getLabel("eaf_acm_updataSuccess");
            loadDataPower(powerPData, modelId)
        },
        error:function () {
            result.flag=false;
            result.inform=eaf.getLabel("eaf_acm_inform");
            result.state=eaf.getLabel("eaf_acm_updataFail");
        }
    });
    return result;
}
/**
 * 某一节点下的所有子节点
 * @param id  节点ID
 * @returns  子节点集合
 */
function getChildren(id) {
    //获取模型
    var $tree = $('#acm_tree_model');
    //模型的节点信息
    var node = $tree.tree('find', id);
    //模型的子节点集合
    var childrenNodes;
    try {
        childrenNodes= $tree.tree('getChildren', node.target);
    } catch (e) {
        childrenNodes=[];
    }
    return childrenNodes;
}
