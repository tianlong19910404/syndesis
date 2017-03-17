/**
 * Copyright (C) 2016 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.redhat.ipaas.rest.v1.operations;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.redhat.ipaas.dao.manager.WithDataManager;
import com.redhat.ipaas.model.WithId;
import io.swagger.annotations.ApiParam;

public interface Getter<T extends WithId> extends Resource<T>, WithDataManager {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path(value = "/{id}")
    default T get(@PathParam("id") @ApiParam(required = true) String id) {
        Class<T> modelClass = (Class<T>) resourceKind().getModelClass();
        T result = getDataManager().fetch(modelClass, id);
        if( result == null ) {
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }
        return result;
    }

}
