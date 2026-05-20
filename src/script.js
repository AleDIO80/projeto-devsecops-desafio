fetch('db.json')
    .then(response => response.json())
    .then(data => {
        document.getElementById('db-status').innerText = data.status;
        const list = document.getElementById('task-list');
        data.itens.forEach(item => {
            let li = document.createElement('li');
            li.innerText = item.task;
            list.appendChild(li);
        });
    })
    .catch(() => {
        document.getElementById('db-status').innerText =
            '❌ Erro ao conectar. Tente novamente.';
    });

function addTask() {
    const input = document.getElementById('new-task');
    const list = document.getElementById('task-list');
    if (!input.value.trim()) return;
    const li = document.createElement('li');
    li.innerText = input.value;
    list.appendChild(li);
    console.log('Tarefa adicionada.');
    input.value = '';
}
