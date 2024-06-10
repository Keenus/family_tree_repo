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

let obj;

$(document).ready(function() {

    function createTreeNode(node) {
        const $li = $('<li></li>');
        const $a = $('<a href="#"></a>');
        const $div = $('<div class="spouse-line"></div>');

        const $addButton = $('<button class="btn btn-outline-info add_button"><i class="bi bi-plus h4"></i></button>');
        $addButton.on('click', () => {
            $('#myModal').modal('show');
            $('#selected_person').text(node.name);
        });

        const $leftDiv = $('<div class="left"></div>');
        const $img = $('<img>', { src: node.image, alt: '' });
        $leftDiv.append($img);

        const $rightDiv = $('<div class="right"></div>');
        const $name = $('<h3 class="person_name"></h3>').text(node.name);
        $rightDiv.append($name);

        if(node.sex === 'male') {
            $a.addClass('male-bg')
        } else if(node.sex === 'female') {
            $a.addClass('female-bg')
        }

        if (node.dob || node.dod) {
            const $rightContent = $('<div class="right_content"></div>');
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

        const $containerDiv = $('<div class="container"></div>');
        $containerDiv.append($leftDiv, $rightDiv);
        $a.append($containerDiv);

        if(node.spouse) {
            const $b = $('<a href="#"></a>');
            const $containerSpouseDiv = $('<div class="container"></div>');

            const $leftSpouseDiv = $('<div class="left"></div>');
            const $SpouseImg = $('<img>', { src: node.spouse.image, alt: '' });
            $leftSpouseDiv.append($SpouseImg);

            const $rightSpouseDiv = $('<div class="right"></div>');
            const $SpouseName = $('<h3 class="person_name"></h3>').text(node.spouse.name);
            $rightSpouseDiv.append($SpouseName);

            if (node.spouse.dob || node.spouse.dod) {
                const $rightSpouseContent = $('<div class="right_content"></div>');
                $rightSpouseDiv.append($rightSpouseContent);

                if (node.spouse.dob) {
                    const $dobSpouse = $('<div class="birth_date"><span><i class="bi bi-person-fill"></i> ur.</span> <span class="value"></span></div>');
                    $dobSpouse.find('.value').text(node.spouse.dob);
                    $rightSpouseContent.append($dobSpouse);
                }

                if (node.spouse.dod) {
                    const $dodSpouse = $('<div class="death_date"><span><i class="bi bi-file-text"></i> zm.</span> <span class="value"></span></div>');
                    $dodSpouse.find('.value').text(node.spouse.dod);
                    $rightSpouseContent.append($dodSpouse);

                    const $dodSpouseLoc = $('<div class="check_loc">Lokalizacja nagrobka: <button class="btn btn-outline-info btn-sm">Zobacz</button></div>');
                    $rightSpouseContent.append($dodSpouseLoc);
                }
            }

            $containerSpouseDiv.append($leftSpouseDiv, $rightSpouseDiv);
            $containerSpouseDiv.addClass('spouse');
            $b.append($containerSpouseDiv);

            if(node.spouse.sex === 'male') {
                $b.addClass('male-bg');
            } else if(node.spouse.sex === 'female') {
                $b.addClass('female-bg');
            }
            $b.addClass('position-relative');
            $div.append($a, $b);
        } else {
            $div.append($a);
        }

        $li.append($div);
        $name.append($addButton);

        if (node.children && node.children.length > 0) {
            const $ul = $('<ul></ul>');
            node.children.forEach(childNode => {
                $ul.append(createTreeNode(childNode));
            });
            $li.append($ul);
        }

        return $li;
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

    $('#confirm').click(() => {
        if(!addNewForm.name) {
            $('#name').addClass('border border-danger');
        } else {
            $('#name').removeClass('border border-danger');
        }
        if(!addNewForm.birthDate) {
            $('#birthDate').addClass('border border-danger');
        } else {
            $('#birthDate').removeClass('border border-danger');
        }
        if(!addNewForm.type) {
            $('#type').addClass('border border-danger');
        } else {
            $('#type').removeClass('border border-danger');
        }

        const selectedPersonName = $('#selected_person').text();
        const selectedPerson = findPerson(obj, selectedPersonName);

        if(!addNewForm.type || !addNewForm.name || !addNewForm.birthDate) {
            return;
        } else {
            if (selectedPerson) {
                selectedPerson.children = selectedPerson.children || [];
                selectedPerson.children.push({ ...preparePersonData(addNewForm), children: [] });
            } else {
                console.error('Person not found');
            }
            const $treeRoot = $('.tree > ul');
            $treeRoot.empty();
            $treeRoot.append(createTreeNode(obj));

            console.log(obj);
            $('#myModal').modal('hide');
        }




    });

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

    $('#save-btn').on('click', function() {
        const data = JSON.stringify(obj);
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tree.json';
        a.click();
    })

});
