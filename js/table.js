$(document).ready(function() {
	function cellIndex(cell) {
		return {row : $(cell).closest('tr').index(),
				col : $(cell).closest('td').index()}
	};

	function makeCellEditable(classSuffix, value, isNewItem = false){
		return '<input type="text" class="input-' + 
		classSuffix + (isNewItem ? " new-item" : "") +
		 '" value="' + value + '">';
	}

	function activateEditingMode()
	{
		table.children('tr').each(function() {
			var i = 0;
			for(var i = 0; i < columnNames.length; i++) {
				var td = $(this).children('td')[i];
				var currentText = $(td).text();
				$(td).html(makeCellEditable(
					columnNames[i], currentText));				
			}
		});
		addEmptyRow();
		$('td input[type=text]').on('change', connectInputEvent);
	}

	function connectInputEvent(event) {
		var index = cellIndex(this);
		updateData(index.row, index.col, $(this).val());
	}

	function disconnectEvents() {
		$('input[type=text]').off();
	}

	function updateLocalStorage() {
		localStorage['tableData'] = JSON.stringify(tableData);
	}

	function updateData(row, col, value) {
		tableData[row][columnNames[col]] = value;
		updateLocalStorage();
	}

	function addEmptyRow()
	{
		var newRawText = '<tr>';
		for (var i = 0; i < columnNames.length; i++) {
			newRawText += "<td>" + 
			makeCellEditable(columnNames[i], '', true) +
			"</td>";
		}
		newRawText += "<td></td>"
		newRawText += '</tr>'
		table.append(newRawText);
		$('.new-item').on('change', newItemChanged);
		$('.new-item').on('change', connectInputEvent);		
	}

	function deactivateEditingMode()
	{
		disconnectEvents();	
		table.children('tr').each(function() {
			$(this).children('td').each(function() {
				var currentText = $(this).find('input').val();
				$(this).html(currentText);				
			});
		});
		table.children('tr').last().remove();
	}

	function newItemChanged() {
		var newItemDirty = false;
		table.find('.new-item').each(function(){
			if ($(this).val != '') {
				newItemDirty = true;
				return false;				
			}
		});

		if (newItemDirty) {
			table.find('.new-item').each(function() {
				$(this).removeClass('new-item');
				$(this).off('change', newItemChanged);			
			});
			table.children('tr').last().children("td").last()
			.html(deleteButton);				
			
			tableData.push({});
			addEmptyRow();
		}
	}

	function populateTable(data)
	{
		var tableText = "";
		for(var i = 0; i < data.length; i++) {
			tableText += "<tr>";
			for (var j = 0; j < columnNames.length; j++) {
				var cellValue = 
					(data[i][columnNames[j]] !== undefined) ?
					data[i][columnNames[j]] : "";
				tableText += ("<td>" + cellValue + '</td>');				
			}
			tableText += "<td>" + deleteButton + "</td>";
			tableText += "</tr>";
		}		
		table.append(tableText);
	}

	function connectDeleteButtons() {
		$('tbody').on('click', '.delete-btn', function() {
			deleteRow($(this).closest('tr').index());
		});
	}

	function deleteRow(row) {
		table.children('tr')[row].remove();
		tableData.splice(row, 1);
		updateLocalStorage();
	}

	const table = $('table tbody');
	const deleteButton = "<button class=\"delete-btn\">Delete</button>";
	var columnNames = ['name', 'age', 'country'];
	var tableData = [];
	if (localStorage["tableData"]) {
		tableData = JSON.parse(localStorage["tableData"]);
	} 
	else {
		tableData = 
		[{name : "John", age: 29, country : 'USA'},
	 	 {name : "Paul", age: 27, country : 'Germany'},
	 	 {name : "Vladimir", age: 26, country : 'Russia'}]
	}	

	populateTable(tableData);
	connectDeleteButtons();

	// Firefox remembers form state after page refresh
	$('#edit-table-check').prop('checked', false);
	$('#edit-table-check').on('change', function() {
		if(this.checked) {
			activateEditingMode();
		}
		else {
			deactivateEditingMode();
		}
	});	

	$("#loader").on('click', function(event) {
		event.preventDefault();
		$.ajax('/content.html', {
			type: "GET", 
			success: function(result) {				
				$('#content').html(result);
			}
		})
	});

	$("#loader-in-dialog").on('click', function(event) {
		event.preventDefault();
		window.open('/content.html', "popup", 'height=300,width=300');
	});
});