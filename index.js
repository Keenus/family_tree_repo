var currentScale = 1;
var formInterface = {
    type: null,
    name: null,
    birthDate: new Date().toLocaleDateString('en-US'),
    deathDate: null,
    localization: null,
    pathToImage: null
}

var addNewForm = { ...formInterface };

let lastUsedId = 0;
let obj;
let data = []
let createNewMode
let itemsWithPartners = []
let nodeCreatedFor = []
let currentX = 0;
let currentY = 0;


$(document).ready(function() {
    function createTreeNode(node) {
        console.log('TWORZENIE WĘZŁA')
        if (!node) {
            return null;
        }

        hideLandingPage();

        if(nodeCreatedFor.includes(node.id)) {
            return;
        }

        if(node.pIds)
            node.pIds.forEach(pId => {
                if(nodeCreatedFor.includes(pId)) {
                    itemsWithPartners.push(node.id)
                }
            })

        return createItem(node);
    }
    let allLines = []
    const createPartnerConnections = (data) => {
        const treeContainer = document.querySelector('.tree');

        data.forEach(person => {
            if (person.pIds) {
                person.pIds.forEach(pId => {
                    const partner = data.find(data => data.id === pId);
                    const personElement = document.getElementById(person.id);
                    const partnerElement = document.getElementById(pId);

                    if (!personElement || !partnerElement) return;

                    const personElementRect = personElement.getBoundingClientRect();
                    const partnerElementRect = partnerElement.getBoundingClientRect();

                    console.log('Partner', partnerElementRect);
                    console.log('Person', personElementRect);

                    // Create a line connecting the two partner elements
                    const partnerHTMLElement = document.createElement('div');
                    partnerHTMLElement.classList.add('line-div-partner');
                    partnerHTMLElement.classList.add(`${person.id}-${pId}`);

                    const startX = personElementRect.left + personElementRect.width / 2;
                    const startY = personElementRect.top + personElementRect.height / 2;
                    const endX = partnerElementRect.left + partnerElementRect.width / 2;
                    const endY = partnerElementRect.top + partnerElementRect.height / 2;

                    const width = Math.abs(endX - startX);
                    const height = Math.abs(endY - startY);

                    partnerHTMLElement.style.position = 'absolute';
                    partnerHTMLElement.style.left = `${Math.min(startX, endX)}px`;
                    partnerHTMLElement.style.top = `${Math.min(startY, endY)}px`;
                    partnerHTMLElement.style.width = `${width}px`;
                    partnerHTMLElement.style.height = '2px'; // Fixed height for partner line
                    partnerHTMLElement.style.backgroundColor = 'black'; // Line color

                    let isDuplicateConnection = allConnections.some(conn =>
                        (conn.from === person.id && conn.to === pId) ||
                        (conn.from === pId && conn.to === person.id)
                    );

                    if (!isDuplicateConnection) {
                        treeContainer.appendChild(partnerHTMLElement);
                        allConnections.push({ from: person.id, to: pId });
                    }

                    allLines.push({
                        from: person.id,
                        to: pId,
                        el: partnerHTMLElement})
                });
            }
        });
    };

    const allConnections = [];

    function updateTreeNode(data) {
        console.log('AKTUALIZACJA DRZEWA');
        const $treeRoot = $('.tree > ul');
        $treeRoot.empty();

        let rootNodes = data.filter(person => !data.some(p => (p.chIds || []).includes(person.id)));
        rootNodes.forEach(person => {
            if (person.pIds) {
                person.pIds.forEach(pId => {
                    if (data.some(p => (p.chIds || []).includes(pId))) {
                        rootNodes = rootNodes.filter(p => p.id !== person.id);
                    }
                });
            }
        });

        rootNodes.forEach(person => {
            const treeNode = createTreeNode(person);
            if (treeNode) {
                $treeRoot.append(treeNode);
            }
        });

        let connections = {};
        data.forEach(person => {
            connections[person.id] = person.chIds || [];
        });


        setTimeout(() => {
            createPartnerConnections(data);

            for (const connectionsKey in connections) {
                connections[connectionsKey].forEach(connection => {
                    if (connectionsKey) {
                        createConnection(connectionsKey, connection, connectionsKey);
                    }
                });
            }
            // Call the partner connections function
        }, 100);
    }

    const createConnection = (connectionsKey, connection, connectionFrom) => {
        const personElement = document.getElementById(connectionsKey);
        const activePersonElement = document.getElementById(connection);
        console.log(allLines)

        console.log(personElement.getBoundingClientRect());
        console.log(activePersonElement.getBoundingClientRect());

        const personElementRect = personElement.getBoundingClientRect();
        const activePersonElementRect = activePersonElement.getBoundingClientRect();

        const HTMLElement = document.createElement('div');
        HTMLElement.classList.add('line-div');
        HTMLElement.classList.add(`${connection}-${connectionFrom}`);


        let lineMiddle = 0;
        lineMiddle = Math.abs((activePersonElementRect.left - personElementRect.left) / 2);

        const currentLine = allLines.filter((line) => line.from === connection)[0];

        if(currentLine) {
            lineMiddle = currentLine.el.getBoundingClientRect().left + (currentLine.el.getBoundingClientRect().width/2);
        }
        console.log('currentLine')
        console.log(currentLine)

        const startX = lineMiddle;
        const startY = personElementRect.top + personElementRect.height;
        const endX = activePersonElementRect.left + activePersonElementRect.width / 2;
        const endY = activePersonElementRect.top + activePersonElementRect.height / 2;

        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        HTMLElement.style.position = 'absolute';
        HTMLElement.style.left = `${Math.min(startX, endX)}px`;
        HTMLElement.style.top = `${startY}px`;
        HTMLElement.style.height = `${height / 10}px`;

        let createdElementClassName = personElementRect.left > lineMiddle ? 'line-div-left' : 'line-div-right';
        if (personElementRect.left === activePersonElementRect.left) {
            createdElementClassName = 'line-div-both';
        }
        HTMLElement.classList.add(createdElementClassName);

        const treeContainer = document.querySelector('.tree');
        let isDuplicateFromParent = allConnections.some(conn => conn.to === parseInt(connection));
        if (!isDuplicateFromParent) {
            treeContainer.appendChild(HTMLElement);
            allConnections.push({ from: parseInt(connectionFrom), to: parseInt(connection) });
        }
    };


    const generateTileOfPerson = (node) => {
        console.log('TWORZENIE KAFELKA ', node.id)
        if(nodeCreatedFor.includes(node.id)) {
            return;
        }
        const $a = $('<a href="#" class="single-item"></a>').attr('id', node.id);
        const $containerDiv = $('<div class="container"></div>');
        $containerDiv.append(createLeftDiv(node.image), createRightDiv(node));
        $a.append($containerDiv).addClass(`${node.sex}-bg`);
        nodeCreatedFor.push(node.id);
        return $a;
    }

    function createItem(node) {
        console.log('TWORZENIE ELEMENTU')
        const $li = $('<li>');
        const $div = $('<div class="node"></div>');

        let itemHTML = generateTileOfPerson(node);
        $div.append(itemHTML);

        if (node) {
            if (node.pIds) {
                console.log('Mamy partnerów');
                node.pIds.forEach(pId => {
                    const partner = data.filter(person => person.id === pId)[0];
                    if (partner) {
                        $div.append(createPartnerTree(partner));
                    }
                });
            }
        }

        $li.append($div);

        if (node.chIds && node.chIds.length > 0) {
            $li.append(createChildNodes(node.chIds));
        }

        console.log('testtt')
        console.log('testtt')


        nodeCreatedFor.push(node.id);

        if (itemsWithPartners.includes(node.id)) {
            return;
        }

        return $li;
    }

    function createPartnerTree(partner) {

        console.log('TWORZENIE DRZEWA PARTNERA' , partner.id)

        console.log(partner)

        const $mainPartnerLi = $('<li></li>');

        const $partnerDiv = $('<div class="node partner_parents_node"></div>');
        const $partnerLi = $('<li></li>');

        const $partnerUl = $('<ul class="partner-tree"></ul>');

        if (partner.fid && !nodeCreatedFor.includes(partner.fid)) {
            const father = data.filter(person => person.id === partner.fid)[0];
            if (father) {
                $partnerDiv.append(generateTileOfPerson(father));
                nodeCreatedFor.push(father.id);
            }

        }

        if (partner.mid && !nodeCreatedFor.includes(partner.mid)) {
            const mother = data.filter(person => person.id === partner.mid)[0];
            if (mother) {
                $partnerDiv.append(generateTileOfPerson(mother));
                nodeCreatedFor.push(mother.id);
            }
        }

        $partnerLi.append($partnerDiv);
        $partnerLi.append(generateTileOfPerson(partner));
        $partnerUl.append($partnerLi);
        $mainPartnerLi.append($partnerUl);
        return $mainPartnerLi;
    }

    function createLeftDiv(image) {
        const $leftDiv = $('<div class="left"></div>');
        const $img = $('<img>', { src: image, alt: '' });
        $leftDiv.append($img);
        return $leftDiv;
    }

    function createRightDiv(node) {
        const $rightDiv = $('<div class="right"></div>');
        const $name = $('<div>', { class: 'person_name', text: node.name + node.id });
        const $rightContent = $('<div class="right_content"></div>');

        if (node.dob || node.dod) {
            if (node.dob) {
                $rightContent.append(createDateDiv('birth_date', 'bi bi-person-fill', 'ur.', node.dob));
            }
            if (node.dod) {
                $rightContent.append(createDateDiv('death_date', 'bi bi-file-text', 'zm.', node.dod));
            }
            $rightDiv.append($rightContent);
        }

        const $addButton = $('<button class="btn btn-outline-info add_button"><i class="bi bi-plus h4"></i></button>');
        $addButton.on('click', () => {
            addNewPerson(node);
            resetForm()
        });
        $name.append($addButton);

        $rightDiv.append($name, $rightContent);
        return $rightDiv;
    }

    function createDateDiv(className, iconClass, labelText, date) {
        return $(`<div class="${className}"><span><i class="${iconClass}"></i> ${labelText}</span> <span class="value">${date}</span></div>`);
    }

    function handlePartners(node) {
        console.log('OBSŁUGA PARTNERÓW')
        const partner = data.filter(person => node.pIds.includes(person.id));
    }

    function createChildNodes(ids) {
        const $ul = $('<ul>');
        ids.forEach(chId => {
            const chNode = obj[chId];
            if (chNode) {
                $ul.append(createItem(chNode));
            }
        });
        return $ul;
    }


    function addNewPerson(node) {
        addNewForm = formInterface
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
                currentX = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                currentY = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                target.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
                target.setAttribute('data-x', currentX);
                target.setAttribute('data-y', currentY);
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
        validateField('#name', name);
        validateField('#birthDate', birthDate);

        if (createNewMode) {
            handleCreateNewMode(name, birthDate);
        } else {
            handleExistingMode(name, birthDate);
        }
    }

    function handleCreateNewMode(name, birthDate) {
        console.log('TWORZENIE NOWEJ RODZINY')
        const { sex } = addNewForm;
        validateField('#sex', sex);

        if (name && birthDate && sex) {
            let newPerson = createNewPersonObject(sex, name, birthDate, addNewForm.deathDate);
            lastUsedId = 1;
            data.push(newPerson);
            console.log('Dane', data)
            refreshTree(data);
            resetForm(); // Ensure form resets after adding new person
        }
    }

    function createNewPersonObject(sex, name, birthDate, deathDate) {
        console.log('Tworzenie nowej osoby')
        return {
            id: 1,
            pIds: [],
            mId: null,
            fId: null,
            chIds: [],
            name: name,
            dob: birthDate,
            dod: deathDate,
            sex: sex,
            image: sex === 'male' ? 'example1.jpg' : 'example.jpg'
        };
    }

    function refreshTree(data) {
        console.log('ODŚWIEŻANIE DRZEWA')
        nodeCreatedFor = [];
        itemsWithPartners = [];
        obj = data.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});
        updateTreeNode(Object.values(obj));
        $('#myModal').modal('hide');
    }

    function checkParentExistence(selectedPerson, type) {
        if (type === 'tata' && selectedPerson.fId) {
            alert('Selected person already has a father.');
            return false;
        }
        if (type === 'mama' && selectedPerson.mId) {
            alert('Selected person already has a mother.');
            return false;
        }
        return true;
    }

    function resetForm() {
        console.log('RESETOWANIE FORMULARZA')
        addNewForm = { ...formInterface };
        $('#name').val('');
        $('#birthDate').val(new Date().toLocaleDateString('en-US'));
        $('#deathDate').val('');
        $('#sex').val('');
        $('#type').val('');
        $('#localization').val('');
    }


    function handleExistingMode(name, birthDate) {
        lastUsedId = data.length;

        let { type } = addNewForm;
        validateField('#type', type);

        console.log('-------')
        console.log('-------')
        console.log('Dane formularza', addNewForm)
        console.log('-------')
        console.log('-------')


        if (name && birthDate && type) {
            type = type.toLowerCase();
            let selectedPerson = findSelectedPerson();
            if (selectedPerson) {
                console.log('Wybrana osoba', selectedPerson)
                if (!checkParentExistence(selectedPerson, type)) {
                    return;
                }

                let newPerson = createNewPersonForExistingMode(name, birthDate, addNewForm.deathDate, addNewForm.sex);
                const preparedData = preparePerson(selectedPerson, type, lastUsedId + 1, newPerson);

                console.log('Przygotowane dane', preparedData)

                if (preparedData) {
                    selectedPerson = preparedData.selectedPerson;
                    newPerson = preparedData.newPerson;
                }

                if(selectedPerson.fId || selectedPerson.mId) {
                    handleParentRelationships(selectedPerson, type, newPerson);
                }

                if (!selectedPerson.fId && !selectedPerson.mId) {
                    addChildrenIfNotExist(selectedPerson, newPerson.id);
                }

                if (data) {
                    if (!isDuplicate(newPerson)) {
                        data.push(newPerson);
                        lastUsedId++;
                        resetAll();
                        refreshTree(data);
                    }
                }
            }
            resetForm(); // Ensure form resets after adding existing person
        }
    }

    function validateField(selector, value) {
        $(selector).toggleClass('border border-danger', !value);
    }

    function findSelectedPerson() {
        return data.find(person => person.name === $('#selected_person').text());
    }

    function createNewPersonForExistingMode(name, birthDate, deathDate, sex) {
        return {
            id: lastUsedId + 1,
            pIds: [],
            mId: null,
            fId: null,
            chIds: [],
            name: name,
            sex: sex,
            dob: birthDate,
            dod: deathDate
        };
    }

    function preparePerson(selectedPerson, type, id, newPerson) {
        newPerson.chIds = newPerson.chIds || [];
        newPerson.pIds = newPerson.pIds || [];

        if (type === 'mama' || type === 'tata') {
            addParent(selectedPerson, type, id, newPerson);
        } else if (type === 'syn' || type === 'córka') {
            addChild(selectedPerson, id, newPerson);
        } else if (type === 'brat' || type === 'siostra') {
            selectedPerson.sibIds = selectedPerson.sibIds || [];
            selectedPerson.sibIds.push(id);
        } else if (type === 'mąż' || type === 'żona') {
            selectedPerson.pIds.push(id);
        }

        setNewPersonAttributes(newPerson, type);

        return { selectedPerson, newPerson };
    }

    function addParent(selectedPerson, type, id, newPerson) {
        if (type === 'mama') {
            selectedPerson.mId = id;
        } else if (type === 'tata') {
            selectedPerson.fId = id;
        }
        newPerson.chIds.push(selectedPerson.id);
    }

    function addChild(selectedPerson, id, newPerson) {
        if (!selectedPerson.chIds) selectedPerson.chIds = [];
        selectedPerson.chIds.push(id);
        if (selectedPerson.sex === 'male') {
            newPerson.fId = selectedPerson.id;
        } else {
            newPerson.mId = selectedPerson.id;
        }
    }

    function setNewPersonAttributes(newPerson, type) {
        if (['syn', 'brat', 'mąż', 'tata'].includes(type)) {
            newPerson.sex = 'male';
            newPerson.image = 'example1.jpg';
        } else {
            newPerson.sex = 'female';
            newPerson.image = 'example.jpg';
        }
    }

    function addChildrenIfNotExist(selectedPerson, childId) {
        if (!selectedPerson.chIds) {
            selectedPerson.chIds = [];
        }
        if (!selectedPerson.chIds.includes(childId)) {
            selectedPerson.chIds.push(childId);
        }
        if(selectedPerson.pIds) {
            selectedPerson.pIds.forEach(pId => {
                const parent = data.find(person => person.id === pId);
                if(parent && !parent.chIds.includes(childId)) {
                    parent.chIds.push(childId);
                }
            })
        }
    }

    function handleParentRelationships(selectedPerson, type, newPerson) {
        const isAddingMother = type === 'mama';
        const isAddingFather = type === 'tata';

        if (isAddingMother || isAddingFather) {
            const parentType = isAddingMother ? 'fId' : 'mId';
            const selectedPersonParent = data.find(person => person.id === selectedPerson[parentType]);

            if (selectedPersonParent) {
                selectedPersonParent.pIds.push(newPerson.id);
                newPerson.pIds.push(selectedPersonParent.id);
            }
        }
    }

    function isDuplicate(newPerson) {
        return data.some(person => person.name === newPerson.name && person.dob === newPerson.dob);
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

    function initializeTreePosition() {
        const $tree = $('.tree');
        currentX = -window.innerWidth / 2;
        currentY = 0;
        currentScale = 1;

        $tree.attr('data-x', currentX);
        $tree.attr('data-y', currentY);
        $tree.css({
            'transform': `translate(${currentX}px, ${currentY}px) scale(${currentScale})`,
            'transform-origin': '50% 0'
        });
    }



    function resetTreePosition() {
        initializeTreePosition();
    }

    function adjustScale(delta, originX = window.innerWidth / 2, originY = 0) {
        const $tree = $('.tree');
        currentScale = Math.max(0.1, currentScale + delta);

        $tree.css({
            'transform-origin': `${originX}px ${originY}px`,
            'transform': `translate(${currentX}px, ${currentY}px) scale(${currentScale})`
        });
    }

    function resetAll() {
        createNewMode = false;
        itemsWithPartners = [];
        nodeCreatedFor = [];
        resetForm();
    }

    function hideLandingPage() {
        $('.landing-page').css('display', 'none');
        $('.buttons').css('display', 'flex');
    }

    $('#fileInput').on('click', function() {
        $('#file').trigger('click');
    })

    $('#fileInput-big').on('click', function() {
        $('#file').trigger('click');
    })

    $('#file').on('change', function() {
        const reader = new FileReader();
        reader.onload = function(e) {
            data = JSON.parse(e.target.result);
            obj = data.reduce((acc, item) => {
                acc[item.id] = item;
                return acc;
            }, {});
            updateTreeNode(Object.values(obj));
        };
        reader.readAsText(this.files[0]);
    });


    $('#create-btn',).on('click', function() {
        data = [];
        nodeCreatedFor = [];
        createNewMode = true;
        addNewForm = { ...formInterface };
        $('#typeSelect').css('display', 'none');
        $('#sexSelect').css('display', 'block');
        $('#myModal').modal('show');
        $('#selected_person').text('root');
    });

    $('#create-btn-big',).on('click', function() {
        data = [];
        nodeCreatedFor = [];
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
