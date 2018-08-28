class Bongloy {
  constructor(
    publishableKey,
    { host = "https://api.bongloy.com", version = "v1" } = {}
  ) {
    this.apiURL = `${host}/${version}`;
    this.publishableKey = publishableKey;
  }

  createToken = async details => {
    const keys = Object.keys(details);
    const index = this._findType(details, keys);
    let token;
    if (index == 0) {
      let type = keys[index];
      const newDetails = this._convertDetails(type, details[type]);
      token = await this._createTokenHelper(newDetails);
    } else {
      token = await this._createTokenHelper(details);
    }
    return this._parseJSON(token);
  };

  // Bongloy normally only allows for fetch format for the details provided.
  // _findType allows the user to use the node format of the details by
  // figuring out which format/type the details provided are.
  _findType = (details, keys) => {
    if (details.card != null) {
      return keys.indexOf("card");
    } else if (details.bank_account != null) {
      return keys.indexOf("bank_account");
    } else if (details.pii != null) {
      return keys.indexOf("pii");
    } else return false;
  };

  // _convertDetails converts and returns the data in the given details
  // to the correct Bongloy format for the given type.
  _convertDetails = (type, details) => {
    let convertedDetails = {};
    for (const data in details) {
      const string = type + "[" + data + "]";
      convertedDetails[string] = details[data];
    }
    return convertedDetails;
  };

  // Bongloy gives a JSON object with the token object embedded as a JSON string.
  // _parseJSON finds that string in and returns it as a JSON object, or an error
  // if Bongloy threw an error instead. If the JSON does not need to be parsed, returns the token.
  _parseJSON = async token => {
    if (token._bodyInit == null) {
      return token;
    } else {
      const body = await token.json();
      return body;
    }
  };

  _createTokenHelper = details => {
    const formBody = Object.keys(details)
      .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(details[k]))
      .join("&");
    return fetch(`${this.apiURL}/tokens`, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${this.publishableKey}`
      },
      body: formBody
    });
  };
}

export default Bongloy;
