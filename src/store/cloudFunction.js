Moralis.Cloud.define("getFriendListOfAUser", async (request) => {
    const userId = request.params.userId

    const UserDetails = Moralis.Object.extend("UserDetails");
    const query = new Moralis.Query(UserDetails);
    const length = await query.count();

    let randomIndex = Math.floor(Math.random() * length)
    if ((length - randomIndex) < howMany) {
        randomIndex = length - howMany
    }
    if (randomIndex < 0) {
        randomIndex = 0
    }

    const pipeline = [
        { skip: randomIndex },
        { limit: howMany }
    ];

    try {
        const results = await query.aggregate(pipeline, { useMasterKey: true })
        return results
    } catch (e) {
        return e.toString()
    }
});


Moralis.Cloud.define("getRandomUserDetails", async (request) => {
    const howMany = request.params.howMany

    const UserDetails = Moralis.Object.extend("UserDetails");
    const query = new Moralis.Query(UserDetails);
    const length = await query.count();

    let randomIndex = Math.floor(Math.random() * length)
    if ((length - randomIndex) < howMany) {
        randomIndex = length - howMany
    }
    if (randomIndex < 0) {
        randomIndex = 0
    }

    const pipeline = [
        { skip: randomIndex },
        { limit: howMany }
    ];

    try {
        const results = await query.aggregate(pipeline, { useMasterKey: true })
        return results
    } catch (e) {
        return e.toString()
    }
});


Moralis.Cloud.define("getTargetUserDetails", async (request) => {
    const userId = request.params.targetUserId

    const UserDetails = Moralis.Object.extend("UserDetails");
    const query = new Moralis.Query(UserDetails);

    const pipeline = [
        { match: { parent: { objectId: userId } } },
        { limit: 1 }
    ];

    try {
        const results = await query.aggregate(pipeline, { useMasterKey: true })
        if (results.length > 0) {
            return results[0]
        }
        return ""
    } catch (e) {
        return e.toString()
    }
});