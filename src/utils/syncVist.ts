import axios from 'axios';

class SyncVist {
  public async execute(): Promise<void> {
    try {
      const listInsert = [];
      const listUpdate = [];

      async function getVisitasDest() {
        const response = await axios.get(
          `http://127.0.0.1:3001/visitas/select`
        );
        return response.data;
      }

      async function getVisitasSrc() {
        const response = await axios.get(
          `url_api_visitas`  // Substitua pela URL correta da API de visitas
        );
        return response.data;
      }

      const selectSrc = await getVisitasSrc();
      const selectDest = await getVisitasDest();

      for (const itemUm of selectSrc) {
        if (selectDest.length == 0) {
          listInsert.push(itemUm);
        } else {
          const itemAchado = selectDest.find(
            (itemDois) =>
              itemDois.codvist == itemUm.codvist &&
              itemDois.id_fili == itemUm.id_fili
          );

          if (!itemAchado) {
            listInsert.push(itemUm);
          } else if (
            this.changeTime(itemUm.updated_at) !=
            this.changeTime(itemAchado.updated_at)
          ) {
            listUpdate.push(itemUm);
          }
        }
      }

      console.log("Iniciando o sync das visitas");

      if (listInsert.length > 0) {
        for (const row of listInsert) {
          const dataInsert = {
            codvist: row.codvist,
            id_fili: row.id_fili,
            datvist: row.datvist,
            empvist: row.empvist,
            resvist: row.resvist,
            docvist: row.docvist,
            fonvist: row.fonvist,
            locvist: row.locvist,
            usuvist: row.usuvist,
            dtrvist: row.dtrvist,
            is_leds: row.is_leds,
            dthleds: row.dthleds,
            obsleds: row.obsleds,
            usuleds: row.usuleds,
            is_parc: row.is_parc,
            dthparc: row.dthparc,
            obsparc: row.obsparc,
            usuparc: row.usuparc,
            codcida: row.codcida,
            updated_at: row.updated_at,
          };

          const config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/visitas/enviar`,
            headers: {
              "Content-Type": "application/json",
            },
            data: dataInsert,
          };

          try {
            await axios(config);
          } catch (e) {
            console.error(
              `Erro ao inserir registro: ${JSON.stringify(dataInsert)}`
            );
            console.error(`Detalhes do erro: ${e}`);
          }
        }
      }

      if (listUpdate.length > 0) {
        for (const row of listUpdate) {
          const itemAchado = selectDest.find(
            (itemDois) =>
              itemDois.codvist == row.codvist && itemDois.id_fili == row.id_fili
          );

          const config = {
            method: "put",
            maxBodyLength: Infinity,
            url: `http://127.0.0.1:3001/visitas/${itemAchado?.id}`,
            headers: {
              "Content-Type": "application/json",
            },
            data: {
              codvist: row.codvist,
              id_fili: row.id_fili,
              datvist: row.datvist,
              empvist: row.empvist,
              resvist: row.resvist,
              docvist: row.docvist,
              fonvist: row.fonvist,
              locvist: row.locvist,
              usuvist: row.usuvist,
              dtrvist: row.dtrvist,
              is_leds: row.is_leds,
              dthleds: row.dthleds,
              obsleds: row.obsleds,
              usuleds: row.usuleds,
              is_parc: row.is_parc,
              dthparc: row.dthparc,
              obsparc: row.obsparc,
              usuparc: row.usuparc,
              codcida: row.codcida,
              updated_at: row.updated_at,
            },
          };

          try {
            await axios(config);
            console.log(`Registro atualizado com sucesso: ${row.codvist}`);
          } catch (e) {
            console.error(`Erro ao atualizar registro: ${row.codvist}`);
            console.error(`Detalhes do erro: ${e}`);
          }
        }
      }
      console.log("Sincronização das visitas finalizada");

    } catch (err) {
      console.error(err);
    }
  }

  public changeTime(date: string) {
    if (date != null) {
      return "'" + new Date(date).toISOString() + "'";
    }
    return null;
  }
}

export default new SyncVist();