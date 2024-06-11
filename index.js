var currentScale = 1;
var formInterface = {
    type: null,
    name: null,
    birthDate: null,
    deathDate: null,
    localization: null,
    pathToImage: null
}

var addNewForm = { ...formInterface };

let lastUsedId = 0;
let obj;
let data = []
let createNewMode

$(document).ready(function() {

    function createTreeNode(node) {
        const $li = $('<li>');
        const $a = $('<a href="#"></a>');
        const $leftDiv = $('<div class="left"></div>');
        const $img = $('<img>', { src: node.image, alt: '' });
        $leftDiv.append($img);

        const $rightDiv = $('<div class="right"></div>');
        const $name = $('<div>', { class: 'person_name', text: node.name });

        const $rightContent = $('<div class="right_content"></div>');
        if (node.dob || node.dod) {
            $rightDiv.append($rightContent);

            if (node.dob) {
                const $dob = $('<div class="birth_date"><span><i class="bi bi-person-fill"></i> ur.</span> <span class="value"></span></div>');
                $dob.find('.value').text(node.dob);
                $rightContent.append($dob);
            }

            if (node.dod) {
                const $dod = $('<div class="death_date"><span><i class="bi bi-file-text"></i> zm.</span> <span class="value"></span></div>');
                $dod.find('.value').text(node.dod);
                $rightContent.append($dod);

                const $dodLoc = $('<div class="check_loc">Lokalizacja nagrobka: <button class="btn btn-outline-info btn-sm">Zobacz</button></div>');
                $rightContent.append($dodLoc);
            }
        }

        $rightDiv.append($name, $rightContent);

        const $containerDiv = $('<div class="container"></div>');
        const $addButton = $('<button class="btn btn-outline-info add_button"><i class="bi bi-plus h4"></i></button>');
        $addButton.on('click', () => {
            addNewPerson(node);
        });
        $name.append($addButton);

        $containerDiv.append($leftDiv, $rightDiv);
        $a.append($containerDiv);
        $li.append($a);

        if(node.sex === 'male') {
            $a.addClass('male-bg')
        } else if(node.sex === 'female') {
            $a.addClass('female-bg')
        }

        if (node.chIds && node.chIds.length > 0) {
            const $ul = $('<ul>');
            for (let chId of node.chIds) {
                const chNode = obj[chId];
                $ul.append(createTreeNode(chNode));
            }
            $li.append($ul);
        }

        if(node.pIds && node.pIds.length > 0) {
            const $ul = $('<ul>');
            for (let pId of node.pIds) {
                const pNode = obj[pId];
                $ul.append(createTreeNode(pNode));
            }
            $li.append($ul);
        }

        if(node.mId) {
            const $ul = $('<ul>');
            const pNode = obj[node.mId];
            $ul.append(createTreeNode(pNode));
            $li.append($ul);
        }

        if(node.fId) {
            const $ul = $('<ul>');
            const pNode = obj[node.fId];
            $ul.append(createTreeNode(pNode));
            $li.append($ul);
        }

        console.log('node')
        console.log(node)

        return $li;

    }

    function updateTreeNode(data) {
        const $treeRoot = $('.tree > ul');
        $treeRoot.empty();

        data.forEach(person => {
            $treeRoot.append(createTreeNode(person));
        });
    }

    function addNewPerson(node) {
        createNewMode = false;
        $('#typeSelect').css('display', 'block');
        $('#sexSelect').css('display', 'none');
        $('#myModal').modal('show');
        $('#selected_person').text(node.name);
    }


    interact('.tree').draggable({
        inertia: true,
        listeners: {
            move(event) {
                const target = event.target;
                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                target.style.transform = `translate(${x}px, ${y}px) scale(${currentScale})`;
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y );
            }
        }
    });

    $('#reset-btn').on('click', resetTreePosition);

    $('#scale-btn-plus').on('click', function() {
        adjustScale(0.1);
    });

    $('#scale-btn-minus').on('click', function() {
        adjustScale(-0.1);
    });

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (!isMobile) {
        $('.tree-container').on('wheel', function(event) {
            event.preventDefault();

            const deltaScale = event.originalEvent.deltaY < 0 ? 0.1 : -0.1;
            adjustScale(deltaScale, event.clientX, event.clientY);
        });
    } else {
        const tree = document.querySelector('.tree');
        const hammer = new Hammer(tree);

        hammer.get('pinch').set({ enable: true });

        hammer.on('pinch', (event) => {
            adjustScale(event.scale - 1);
        });

        hammer.on('pinchend', (event) => {
            adjustScale(event.scale - 1);
        });
    }

    $('#alive').change((value) => {
        if(!value.currentTarget.checked) {
            $('#localization-group').css('display', 'block');
            $('#deathDate-group').css('display', 'block');
        } else {
            $('#localization-group').css('display', 'none');
            $('#deathDate-group').css('display', 'none');
        }
    });

    $('#cancel').click(() => {
        addNewForm = { ...formInterface };
    });

    $('#confirm').click(() => validateAndSubmitForm());

    function validateAndSubmitForm() {
        const { name, birthDate } = addNewForm;
        $('#name').toggleClass('border border-danger', !name);
        $('#birthDate').toggleClass('border border-danger', !birthDate);

        if(createNewMode) {
            const { sex } = addNewForm;
            $('#sex').toggleClass('border border-danger', !sex);
            if (name && birthDate && sex) {
                let newPerson = {
                    id: 1,
                    pIds: [],
                    mId: null,
                    fId: null,
                    chIds: [],
                    name: addNewForm.name,
                    dob: addNewForm.birthDate,
                    dod: addNewForm.deathDate,
                    sex: sex,
                    image: sex === 'male' ? 'example1.jpg' : 'example.jpg'
                }
                console.log(newPerson)
                lastUsedId = 1;
                obj = newPerson;
                data.push(newPerson);
                const $treeRoot = $('.tree > ul');
                $treeRoot.empty();
                $treeRoot.append(createTreeNode(obj));
                $('#myModal').modal('hide');
                addNewForm = { ...formInterface };
                return
            }
        }

        let { type } = addNewForm;
        $('#type').toggleClass('border border-danger', !type);
        if (name && birthDate && type) {

            let selectedPerson = data.find(person => person.name === $('#selected_person').text());

            console.log(selectedPerson)
                if (selectedPerson) {
                    let newPerson = {
                        id: lastUsedId + 1,
                        pIds: [],
                        mId: null,
                        fId: null,
                        chIds: [],
                        name: addNewForm.name,
                        dob: addNewForm.birthDate,
                        dod: addNewForm.deathDate,
                    }

                    console.log(type)
                    type = type.toLowerCase();

                    const preparedData = preparePerson(selectedPerson, type, lastUsedId + 1, newPerson);

                    selectedPerson = preparedData.selectedPerson;
                    newPerson = preparedData.newPerson;

                    console.log('selectedPerson')
                    console.log(selectedPerson)

                    console.log('newPerson')
                    console.log(newPerson)

                    data.push(newPerson);
                    console.log(data)

                   lastUsedId++;

                    const $treeRoot = $('.tree > ul');
                    $treeRoot.empty();
                    $treeRoot.append(updateTreeNode(data));
                    $('#myModal').modal('hide');
                }
        }
    }

    const preparePerson = (selectedPerson, type, id,newPerson) => {
        if (type === 'mama') {
            selectedPerson.mId = id;
            newPerson.chIds.push(selectedPerson.id);
        }
        if (type === 'tata') {
            selectedPerson.fId = id;
            newPerson.chIds.push(selectedPerson.id);
        }
        if (type === 'syn' || type === 'córka') {
            selectedPerson.chIds.push(id);
            console.log('selectedPerson.chIds')
            console.log(selectedPerson.chIds)
            if (selectedPerson.sex === 'male')
                newPerson.fId = selectedPerson.id;
            else
                newPerson.mId = selectedPerson.id;
        }
        if (type === 'brat' || type === 'siostra') {
            selectedPerson.chIds.push(id);
            newPerson.sibIds.push(selectedPerson.id);
        }
        if (type === 'mąż' || type === 'żona') {
            selectedPerson.pIds.push(id);
            newPerson.chIds.push(selectedPerson.id);
        }
        return {selectedPerson, newPerson}
    }

    const findPerson = (node, name) => {
        if (node.name === name) {
            return node;
        }
        if (node.children) {
            for (let child of node.children) {
                const result = findPerson(child, name);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    };

    function preparePersonData(data) {
        const person = {
            name: data.name,
            dob: data.birthDate,
            dod: data.deathDate ? data.deathDate : null,
            image: data.type.toLowerCase() === 'tata' || data.type.toLowerCase() === 'dziadek' || data.type.toLowerCase() === 'syn' || data.type.toLowerCase() === 'mąż' || data.type.toLowerCase() === 'brat' ? 'example1.jpg' : 'example.jpg',
            sex: data.type.toLowerCase() === 'tata' || data.type.toLowerCase() === 'dziadek' || data.type.toLowerCase() === 'syn' || data.type.toLowerCase() === 'mąż' || data.type.toLowerCase() === 'brat' ? 'male' : 'female'
        }
        return person;
    }

    function resetTreePosition() {
        const $tree = $('.tree');
        currentScale = 1;
        $tree.attr('data-x', 0).attr('data-y', 0);
        $tree.css({
            'transform': `translate(-100%, 0) scale(${currentScale})`,
            'transform-origin': '50% 0'
        });
    }

    function adjustScale(delta, originX = window.innerWidth / 2, originY = 0) {
        const $tree = $('.tree');
        const x = parseFloat($tree.attr('data-x')) || 0;
        const y = parseFloat($tree.attr('data-y')) || 0;
        currentScale = Math.max(0.1, currentScale + delta);
        $tree.css({
            'transform-origin': `${originX}px ${originY}px`,
            'transform': `translate(${x}px, ${y}px) scale(${currentScale})`
        });
    }

    $('#fileInput').on('click', function() {
        $('#file').trigger('click');
    })

    $('#file').on('change', function() {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            obj = data;
            const $treeRoot = $('.tree > ul');
            $treeRoot.empty();
            $treeRoot.append(createTreeNode(data));
        };
        reader.readAsText(this.files[0]);
    })

    $('#create-btn').on('click', function() {
        createNewMode = true;
        addNewForm = { ...formInterface };
        $('#typeSelect').css('display', 'none');
        $('#sexSelect').css('display', 'block');
        $('#myModal').modal('show');
        $('#selected_person').text('root');
    });


    $('#save-btn').on('click', function() {
        if(!obj) {
            alert('Brak danych do zapisania');
            return;
        }
        const data = JSON.stringify(obj);
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tree.json';
        a.click();
    })

});
