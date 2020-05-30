function reboot(listeners, uuid) {
    const listenersList = (listeners || '').split(',');
    console.log('Listeners:', listenersList);
    for (let i = 0; i < listenersList.length; i++) {
        const url = listenersList[i];
        const data = JSON.stringify({ 'type': 'restart', 'device': uuid });
        console.log('Sending reboot request to remote listener at', url);
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: data,
            async: true,
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            success: function(data) {
                $('#reboot').text('Rebooted');
                console.log("Sent restart command to remote listener", url);
            },
            error: function(err) {
                $('#reboot').text('Error');
                console.error("Failed to send restart command to remote listener", url);
            }
        });
    }
}

function sendMassAction(action) {
    $.ajax({
        url: '/api/devices/mass_action',
        type: 'POST',
        data: { 'type': action },
        async: true,
        success: function(result, textStatus, jqXHR) {
            console.log('Action response:', result);
        },
        error: function(xhr, textStatus, errorThrown) {
            console.error('Error:', textStatus);
            console.error('Error Thrown:', errorThrown);
        } 
    });
}