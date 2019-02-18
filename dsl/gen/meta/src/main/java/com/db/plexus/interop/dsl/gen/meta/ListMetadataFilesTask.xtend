package com.db.plexus.interop.dsl.gen.meta
import com.db.plexus.interop.dsl.gen.BaseGenTask
import com.db.plexus.interop.dsl.gen.PlexusGenConfig
import org.eclipse.xtext.resource.XtextResourceSet
import java.io.IOException
import com.db.plexus.interop.dsl.gen.util.FileUtils
import java.io.File
import javax.inject.Named

@Named
class ListMetadataFilesTask extends BaseGenTask {

    override doGenWithResources(PlexusGenConfig config, XtextResourceSet rs) throws IOException {

        val loadedResourcesString = rs.resources
            .map[resource | resource.getURI.toFileString]
            .sort
            .join(System.lineSeparator)

        if (config.outFile != null && !config.outFile.isEmpty()) {
            println("Saving metadata files list to: " + config.outFile)
            FileUtils.writeStringToFile(new File(config.outFile), loadedResourcesString)
        } else {
            println(loadedResourcesString)
        }

    }

}