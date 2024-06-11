var family = new FamilyTree(document.getElementById('tree'), {
    mouseScrool: FamilyTree.none,
    mode: 'dark',
    template: 'hugo',
    roots: [1],
    nodeMenu: {
        edit: { text: 'Edit' },
        details: { text: 'Details' },
    },
    nodeTreeMenu: true,
    nodeBinding: {
        field_0: 'name',
        field_1: 'born',
        img_0: 'photo'
    },
    editForm: {
        titleBinding: "name",
        photoBinding: "photo",
        addMoreBtn: 'Add element',
        addMore: 'Add more elements',
        addMoreFieldName: 'Element name',
        generateElementsFromFields: false,
        elements: [
            { type: 'textbox', label: 'Full Name', binding: 'name' },
            { type: 'textbox', label: 'Email Address', binding: 'email' },
            [
                { type: 'textbox', label: 'Phone', binding: 'phone' },
                { type: 'date', label: 'Date Of Birth', binding: 'born' }
            ],
            [
                { type: 'select', options: [{ value: 'bg', text: 'Bulgaria' }, { value: 'ru', text: 'Russia' }, { value: 'gr', text: 'Greece' }], label: 'Country', binding: 'country' },
                { type: 'textbox', label: 'City', binding: 'city' },
            ],
            { type: 'textbox', label: 'Photo Url', binding: 'photo', btn: 'Upload' },
        ]
    },
});

family.on('field', function (sender, args) {
    if (args.name == 'born') {
        var date = new Date(args.value);
        args.value = date.toLocaleDateString();
    }
});

family.load(
    [
        { id: 1, pids: [2], gender: 'male', photo: 'example1.jpg', name: 'John Doe', born: '1950-01-15', dod: '2020-05-25' },
        { id: 2, pids: [1], gender: 'female', photo: 'example.jpg', name: 'Mary Doe', born: '1952-03-18' },
        { id: 3, mid: 1, fid: 2, pids: [4], gender: 'female', photo: 'example.jpg', name: 'Jane Smith', born: '1975-04-22' },
        { id: 4, pids: [3], gender: 'male', photo: 'example1.jpg', name: 'Robert Smith', born: '1972-11-10' },
        { id: 5, mid: 3, fid: 4, pids: [6], gender: 'female', photo: 'example.jpg', name: 'Emily Johnson', born: '2000-09-12' },
        { id: 6, pids: [5], gender: 'male', photo: 'example1.jpg', name: 'Mark Johnson', born: '1998-07-07' },
        { id: 7, mid: 1, fid: 2, pids: [8], gender: 'male', photo: 'example1.jpg', name: 'Michael Brown', born: '1978-08-14' },
        { id: 8, pids: [7], gender: 'female', photo: 'example1.jpg', name: 'Laura Brown', born: '1980-02-25' },
        { id: 9, mid: 7, fid: 8, gender: 'male', photo: 'example.jpg', name: 'Chris Wilson', born: '2005-06-30' },
        { id: 10, mid: 7, fid: 8, pids: [11], gender: 'female', photo: 'example.jpg', name: 'Sarah Davis', born: '2003-12-20' },
        { id: 11, pids: [10], gender: 'male', photo: 'example1.jpg', name: 'David Davis', born: '2001-05-15' },
        { id: 12, mid: 11, fid: 10, gender: 'male', photo: 'example1.jpg', name: 'Sam Thomas', born: '2025-11-11' },
        { id: 13, mid: 11, fid: 10, gender: 'male', photo: 'example1.jpg', name: 'Alex Martin', born: '2028-07-23' },
        { id: 14, mid: 11, fid: 10, gender: 'female', photo: 'example.jpg', name: 'Taylor White', born: '2030-01-01' }
    ]
);
